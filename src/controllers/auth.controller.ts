import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export const login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'El correo no existe en la base de datos' });
    }

    let isMatch = (user.contrasena === contrasena);
    
    if (!isMatch) {
      isMatch = await bcrypt.compare(contrasena, user.contrasena);
    }

    if (isMatch) {
      const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '50d' });
      res.json({ success: true, token, user: { id: user.id_usuario, nombre: user.nombre, role: user.id_rol } });
    } else {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ success: false, error: 'Error en el servidor durante el login' });
  }
};

export const registerGeneral = async (req: Request, res: Response) => {
  const clientDB = await pool.connect();
  try {
    await clientDB.query('BEGIN');
    const { nombre, correo, contrasena, id_rol } = req.body;

    const userExists = await clientDB.query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) {
      throw new Error('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const insertUserQuery = `
      INSERT INTO usuario (nombre, correo, contrasena, id_rol) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_usuario
    `;
    const userResult = await clientDB.query(insertUserQuery, [nombre, correo, hashedPassword, id_rol]);
    const nuevoIdUsuario = userResult.rows[0].id_usuario;

    if (id_rol === 2 || id_rol === '2') {
      const insertOwnerQuery = `
        INSERT INTO restaurant_owner ("userId", "createdAt") 
        VALUES ($1, NOW())
      `;
      await clientDB.query(insertOwnerQuery, [nuevoIdUsuario]);
      console.log(`✅ Restaurantero guardado en tabla 'restaurant_owner' con userId: ${nuevoIdUsuario}`);

    } else if (id_rol === 3 || id_rol === '3') {
      const insertClientQuery = `
        INSERT INTO client ("userId", "createdAt", "updatedAt") 
        VALUES ($1, NOW(), NOW())
      `;
      await clientDB.query(insertClientQuery, [nuevoIdUsuario]);
      console.log(`✅ Cliente guardado en tabla 'client' con userId: ${nuevoIdUsuario}`);
    }

    await clientDB.query('COMMIT');
    
    const token = jwt.sign({ id: nuevoIdUsuario, role: id_rol }, JWT_SECRET, { expiresIn: '50d' });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: nuevoIdUsuario, nombre, role: id_rol }
    });

  } catch (error: any) {
    await clientDB.query('ROLLBACK');
    console.error("❌ Error en el registro general:", error);
    res.status(500).json({ success: false, error: error.message || 'Error en el servidor' });
  } finally {
    clientDB.release();
  }
};

export const registerClient = async (req: Request, res: Response) => {
  const clientDB = await pool.connect();
  try {
    await clientDB.query('BEGIN');
    const { nombre, correo, contrasena, id_rol } = req.body;

    console.log('📝 Solicitud de registro recibida:', { nombre, correo, id_rol });

    if (!nombre || !correo || !contrasena) {
      throw new Error('Todos los campos son obligatorios');
    }

    const usuarioExistente = await clientDB.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
    if (usuarioExistente.rows.length > 0) {
      throw new Error('Este correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const rolAsignado = id_rol || 3;
    const nuevoUsuario = await clientDB.query(
      `INSERT INTO usuario (nombre, correo, contrasena, id_rol, foto_evidencia) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id_usuario, nombre, correo, id_rol`,
      [nombre, correo, hashedPassword, rolAsignado, null]
    );

    const user = nuevoUsuario.rows[0];

    if (rolAsignado === 2 || rolAsignado === '2') {
      await clientDB.query(`INSERT INTO restaurant_owner ("userId", "createdAt") VALUES ($1, NOW())`, [user.id_usuario]);
      console.log(`✅ Restaurantero creado exitosamente en 'restaurant_owner'`);
    } else if (rolAsignado === 3 || rolAsignado === '3') {
      await clientDB.query(`INSERT INTO client ("userId", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW())`, [user.id_usuario]);
      console.log(`✅ Cliente creado exitosamente en 'client'`);
    }

    await clientDB.query('COMMIT');

    const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '50d' });
    
    const rolResult = await pool.query('SELECT nombre_rol FROM rol WHERE id_rol = $1', [user.id_rol]);
    const nombreRol = rolResult.rows[0]?.nombre_rol || 'Usuario';

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.id_rol,
          nombre_rol: nombreRol
        },
        token,
      },
    });
  } catch (error: any) {
    await clientDB.query('ROLLBACK');
    console.error('❌ Error al registrar usuario:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Error al registrar usuario'
    });
  } finally {
    clientDB.release();
  }
};