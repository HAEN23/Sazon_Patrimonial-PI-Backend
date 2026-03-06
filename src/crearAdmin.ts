// src/crearAdmin.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5436'),
  user: process.env.DB_USER || 'sazon_admin',
  password: process.env.DB_PASSWORD || 'sazon_secure_2024',
  database: process.env.DB_NAME || 'sazon_patrimonial',
});

async function crearAdmin() {
  try {
    const correo = 'admin@sazon.com'; // <--- CORREO DE ADMIN
    const pass = 'admin123';          // <--- CONTRASEÑA DE ADMIN
    const nombre = 'Super Admin';
    
    // 1. Hashear contraseña
    const hash = await bcrypt.hash(pass, 10);
    
    // 2. Insertar usuario DIRECTO (rol 1 = Admin)
    const res = await pool.query(`
      INSERT INTO usuario (nombre, correo, contrasena, id_rol)
      VALUES ($1, $2, $3, 1)
      RETURNING *
    `, [nombre, correo, hash]);
    
    console.log('✅ ¡ADMINISTRADOR CREADO CON ÉXITO!');
    console.log(res.rows[0]);

  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await pool.end();
  }
}

crearAdmin();