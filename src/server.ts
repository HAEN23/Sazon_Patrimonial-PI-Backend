import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

// Middleware de autenticación
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    
    if (result.rows.length > 0 && result.rows[0].id_rol === 1) { // Asumiendo 1 = Admin
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol de administrador' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error verificando rol' });
  }
};

// ==================== RUTAS ====================

// LOGIN (Ejemplo básico)
app.post('/api/login', async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
    const user = result.rows[0];

    if (user && user.contrasena === contrasena) { // Nota: En producción usa bcrypt!
      const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token, user: { id: user.id_usuario, nombre: user.nombre, role: user.id_rol } });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error en login' });
  }
});

// OBTENER SOLICITUDES PENDIENTES (Admin)
app.get('/api/solicitudes/estado/Pendiente', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    // Obtenemos todos los campos nuevos de la solicitud
    const result = await pool.query(`
      SELECT 
        s.id_solicitud,
        s.nombre_propuesto_restaurante as restaurante,
        s.nombre_propietario as propietario,
        s.correo,
        s.horario_atencion as horario,
        s.direccion,      -- Link de Maps
        s.telefono,
        s.foto_portada as img_url,
        s.foto_2,
        s.foto_3,
        s.menu_pdf as pdf_url,
        u.id_usuario
      FROM solicitud_registro s
      LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
      WHERE s.estado = 'Pendiente'
      ORDER BY s.fecha DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener solicitudes' });
  }
});

// OBTENER MI RESTAURANTE (Restaurantero)
app.get('/api/mi-restaurante', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Buscamos la solicitud más reciente del usuario
    const query = `
      SELECT * FROM solicitud_registro 
      WHERE id_usuario = $1 
      ORDER BY fecha DESC LIMIT 1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener datos' });
  }
});

// GUARDAR/ACTUALIZAR RESTAURANTE (Restaurantero) - CORREGIDO
app.put('/api/mi-restaurante', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    console.log(`🔹 Guardando datos para Usuario ID: ${userId}`);

    const { 
      nombre, 
      direccion, // Link de Maps
      horario, 
      telefono, 
      facebook, 
      instagram, 
      etiquetas,
      foto_portada,
      foto_2, // <--- NUEVO
      foto_3, // <--- NUEVO
      menu_pdf 
    } = req.body;

    // 1. Obtener datos OBLIGATORIOS del usuario (Nombre y Correo)
    // Esto soluciona el error "null value in column 'correo'"
    const userQuery = 'SELECT nombre, correo FROM usuario WHERE id_usuario = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado en la base de datos' });
    }

    const usuario = userResult.rows[0];
    const nombrePropietario = usuario.nombre || 'Propietario Desconocido';
    const correoPropietario = usuario.correo || 'sin_correo@ejemplo.com';

    // 2. Verificar si ya existe una solicitud para este usuario
    const checkQuery = 'SELECT id_solicitud FROM solicitud_registro WHERE id_usuario = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length > 0) {
      // --- ACTUALIZAR (UPDATE) ---
      console.log(`🔸 Actualizando solicitud existente...`);
      
      const updateQuery = `
        UPDATE solicitud_registro SET
          nombre_propuesto_restaurante = $1,
          direccion = $2,
          horario_atencion = $3,
          telefono = $4,
          facebook = $5,
          instagram = $6,
          etiquetas = $7,
          foto_portada = $8,
          foto_2 = $9,
          foto_3 = $10,
          menu_pdf = $11,
          estado = 'Pendiente',
          fecha = NOW()
        WHERE id_usuario = $12
      `;
      
      await pool.query(updateQuery, [
        nombre, direccion, horario, telefono, facebook, instagram, etiquetas, 
        foto_portada, foto_2, foto_3, menu_pdf, userId
      ]);

    } else {
      // --- CREAR NUEVA (INSERT) ---
      console.log(`🆕 Creando nueva solicitud con correo: ${correoPropietario}`);

      const insertQuery = `
        INSERT INTO solicitud_registro (
          id_usuario, 
          nombre_propuesto_restaurante, 
          correo,
          nombre_propietario,
          direccion, 
          horario_atencion, 
          telefono, 
          facebook, 
          instagram, 
          etiquetas, 
          foto_portada,
          foto_2,
          foto_3,
          menu_pdf, 
          fecha, 
          estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), 'Pendiente')
      `;

      await pool.query(insertQuery, [
        userId, 
        nombre, 
        correoPropietario, 
        nombrePropietario,
        direccion, 
        horario, 
        telefono, 
        facebook, 
        instagram, 
        etiquetas, 
        foto_portada,
        foto_2,
        foto_3,
        menu_pdf
      ]);
    }

    res.json({ success: true, message: 'Datos guardados correctamente' });

  } catch (error: any) {
    console.error('❌ Error CRÍTICO al guardar:', error);
    res.status(500).json({ success: false, error: 'Error interno: ' + error.message });
  }
});

// APROBAR SOLICITUD (Admin)
app.patch('/api/solicitudes/:id/aprobar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // 1. Obtener solicitud
    const solRes = await client.query('SELECT * FROM solicitud_registro WHERE id_solicitud = $1', [id]);
    if (solRes.rows.length === 0) throw new Error('Solicitud no encontrada');
    const sol = solRes.rows[0];

    // 2. Crear Restaurante
    const insertRest = `
      INSERT INTO restaurante (
        nombre, id_usuario, id_solicitud, direccion, link_direccion, 
        telefono, horario_atencion, facebook, instagram, etiquetas, 
        foto_portada, zona
      ) VALUES ($1, $2, $3, 'Dirección física', $4, $5, $6, $7, $8, $9, $10, 'Centro')
      RETURNING id_restaurante
    `;
    
    // Mapeamos los campos de la solicitud al restaurante
    const nuevoRest = await client.query(insertRest, [
      sol.nombre_propuesto_restaurante,
      sol.id_usuario,
      sol.id_solicitud,
      sol.direccion, // Link de Maps
      sol.telefono,
      sol.horario_atencion,
      sol.facebook,
      sol.instagram,
      sol.etiquetas,
      sol.foto_portada
    ]);
    
    const idRestaurante = nuevoRest.rows[0].id_restaurante;

    // 3. Actualizar solicitud (Aprobado + ID Restaurante)
    await client.query(
      "UPDATE solicitud_registro SET estado = 'Aprobado', id_restaurante = $1 WHERE id_solicitud = $2",
      [idRestaurante, id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Restaurante aprobado y creado' });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error aprobando:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// RECHAZAR SOLICITUD (Admin)
app.patch('/api/solicitudes/:id/rechazar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE solicitud_registro SET estado = 'Rechazado' WHERE id_solicitud = $1", [id]);
    res.json({ success: true, message: 'Solicitud rechazada' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al rechazar' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
