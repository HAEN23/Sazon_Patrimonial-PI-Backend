import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'sazon_patrimonial_secret_key_2024';


// Pool de conexiones PostgreSQL
console.log('--- DIAGNOSTICO DE CONEXION ---');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('-----------------------------');

const pool = new Pool({
  host: 'localhost',
  port: 5436,             // <--- FORZADO A MANO
  user: 'sazon_admin',    // <--- FORZADO A MANO
  password: 'sazon_secure_2024', // <--- FORZADO A MANO
  database: 'sazon_patrimonial', // <--- FORZADO A MANO
});
// Test de conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a PostgreSQL');
    release();
  }
});

// DIAGNÓSTICO DE TABLAS Y USUARIOS
pool.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
`, (err, res) => {
  if (err) console.error('Error diagnosticando:', err);
  else {
    console.log('--- TABLAS EN LA BASE DE DATOS (Servidor) ---');
    console.table(res.rows);
    console.log('---------------------------------------------');
    
    // Ver usuarios existentes
    pool.query('SELECT id_usuario, correo, id_rol FROM usuario', (err, res) => {
        if(!err) {
            console.log('--- USUARIOS REALES EN LA BASE ---');
            console.table(res.rows);
            console.log('----------------------------------');
        } else {
            console.log('ERROR LEYENDO USUARIOS:', err.message);
        }
    });
  }
});

// ==================== MIDDLEWARES ====================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticación JWT
interface AuthRequest extends Request {
  userId?: number;
  userRole?: number;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado',
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido o expirado',
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Middleware para verificar rol de administrador
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 1) { // 1 = Administrador
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador',
    });
  }
  next();
};

// ==================== RUTAS ====================

// ========== RAÍZ - DOCUMENTACIÓN ==========

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🍽️ API Sazon Patrimonial',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: {
      general: {
        base: 'GET /',
        health: 'GET /api/health',
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me [Auth Required]',
      },
      usuarios: {
        list: 'GET /api/usuarios [Auth Required]',
        get: 'GET /api/usuarios/:id [Auth Required]',
        update: 'PUT /api/usuarios/:id [Auth Required]',
        delete: 'DELETE /api/usuarios/:id [Auth Required, Admin]',
        perfil: 'GET /api/usuarios/perfil [Auth Required]',
        updatePerfil: 'PUT /api/usuarios/perfil [Auth Required]',
      },
      restaurantes: {
        list: 'GET /api/restaurantes',
        get: 'GET /api/restaurantes/:id',
        create: 'POST /api/restaurantes [Auth Required]',
        update: 'PUT /api/restaurantes/:id [Auth Required]',
        delete: 'DELETE /api/restaurantes/:id [Auth Required, Admin]',
        byZona: 'GET /api/restaurantes/zona/:zona',
        search: 'GET /api/restaurantes/buscar?q=...',
      },
      solicitudes: {
        list: 'GET /api/solicitudes [Auth Required]',
        get: 'GET /api/solicitudes/:id [Auth Required]',
        create: 'POST /api/solicitudes [Auth Required]',
        update: 'PUT /api/solicitudes/:id [Auth Required]',
        delete: 'DELETE /api/solicitudes/:id [Auth Required]',
        aprobar: 'PATCH /api/solicitudes/:id/aprobar [Auth Required, Admin]',
        rechazar: 'PATCH /api/solicitudes/:id/rechazar [Auth Required, Admin]',
        pendientes: 'GET /api/solicitudes/estado/Pendiente [Auth Required, Admin]',
      },
      revisiones: {
        list: 'GET /api/revisiones [Auth Required, Admin]',
        get: 'GET /api/revisiones/:id [Auth Required]',
        create: 'POST /api/revisiones [Auth Required, Admin]',
        bySolicitud: 'GET /api/revisiones/solicitud/:id [Auth Required]',
      },
      comprobantes: {
        list: 'GET /api/comprobantes [Auth Required]',
        get: 'GET /api/comprobantes/:id [Auth Required]',
        create: 'POST /api/comprobantes [Auth Required]',
        delete: 'DELETE /api/comprobantes/:id [Auth Required]',
        bySolicitud: 'GET /api/comprobantes/solicitud/:id [Auth Required]',
        byRestaurante: 'GET /api/comprobantes/restaurante/:id [Auth Required]',
      },
      menus: {
        list: 'GET /api/menus',
        get: 'GET /api/menus/:id',
        create: 'POST /api/menus [Auth Required]',
        delete: 'DELETE /api/menus/:id [Auth Required]',
        byRestaurante: 'GET /api/menus/restaurante/:id',
        download: 'PATCH /api/menus/:id/descargar',
      },
      favoritos: {
        list: 'GET /api/favoritos [Auth Required]',
        add: 'POST /api/favoritos [Auth Required]',
        remove: 'DELETE /api/favoritos/:restauranteId [Auth Required]',
        check: 'GET /api/favoritos/check/:restauranteId [Auth Required]',
      },
      roles: {
        list: 'GET /api/roles',
        get: 'GET /api/roles/:id',
      },
    },
  });
});

// ========== HEALTH CHECK ==========

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// ==================== AUTENTICACIÓN ====================

// Registro de usuario
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contrasena, id_rol = 3, foto_evidencia = null } = req.body;

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, correo y contraseña son requeridos',
      });
    }

    // Verificar si el correo ya existe
    const existingUser = await pool.query(
      'SELECT * FROM usuario WHERE correo = $1',
      [correo]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El correo ya está registrado',
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO usuario (nombre, correo, contrasena, id_rol, foto_evidencia)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, correo, id_rol, foto_evidencia`,
      [nombre, correo, hashedPassword, id_rol, foto_evidencia]
    );

    const user = result.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, role: user.id_rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.id_rol,
          foto_evidencia: user.foto_evidencia,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
    });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { correo, contrasena } = req.body;

    // Validaciones
    if (!correo || !contrasena) {
      return res.status(400).json({
        success: false,
        error: 'Correo y contraseña son requeridos',
      });
    }

    // Buscar usuario
    const result = await pool.query(
      `SELECT u.*, r.nombre_rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.correo = $1`,
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, role: user.id_rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.id_rol,
          nombre_rol: user.nombre_rol,
          foto_evidencia: user.foto_evidencia,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
    });
  }
});

// Obtener usuario autenticado
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, u.foto_evidencia, r.nombre_rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
    });
  }
});

// ==================== USUARIOS ====================

// Listar usuarios
app.get('/api/usuarios', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { rol } = req.query;
    
    let query = `
      SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, u.foto_evidencia, r.nombre_rol
      FROM usuario u
      LEFT JOIN rol r ON u.id_rol = r.id_rol
    `;
    
    const params: any[] = [];
    
    if (rol) {
      query += ` WHERE u.id_rol = $1`;
      params.push(rol);
    }
    
    query += ` ORDER BY u.id_usuario`;
    
    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
    });
  }
});

// Obtener usuario por ID
app.get('/api/usuarios/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, u.foto_evidencia, r.nombre_rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
    });
  }
});

// Actualizar usuario
app.put('/api/usuarios/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, correo, foto_evidencia } = req.body;

    // Verificar que el usuario solo pueda actualizar su propio perfil o sea admin
    if (req.userId !== parseInt(id) && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar este usuario',
      });
    }

    const result = await pool.query(
      `UPDATE usuario 
       SET nombre = $1, correo = $2, foto_evidencia = $3
       WHERE id_usuario = $4
       RETURNING id_usuario, nombre, correo, id_rol, foto_evidencia`,
      [nombre, correo, foto_evidencia, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario',
    });
  }
});

// Eliminar usuario (solo admin)
app.delete('/api/usuarios/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario',
    });
  }
});

// ==================== RESTAURANTES ====================

// Listar restaurantes
app.get('/api/restaurantes', async (req: Request, res: Response) => {
  try {
    const { zona, limit = '50', offset = '0' } = req.query;
    
    let query = `
      SELECT 
        r.*,
        u.nombre as nombre_propietario,
        u.correo as correo_propietario
      FROM restaurante r
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
    `;
    
    const params: any[] = [];
    
    if (zona) {
      query += ` WHERE r.zona = $1`;
      params.push(zona);
      query += ` ORDER BY r.nombre LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY r.nombre LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await pool.query(query, params);
    
    // Contar total
    const countQuery = zona 
      ? 'SELECT COUNT(*) FROM restaurante WHERE zona = $1'
      : 'SELECT COUNT(*) FROM restaurante';
    const countParams = zona ? [zona] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      count: result.rows.length,
      total,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener restaurantes',
    });
  }
});

// Obtener restaurante por ID
app.get('/api/restaurantes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        r.*,
        u.nombre as nombre_propietario,
        u.correo as correo_propietario
      FROM restaurante r
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
      WHERE r.id_restaurante = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurante no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener restaurante',
    });
  }
});

// Crear restaurante
app.post('/api/restaurantes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      nombre,
      horario,
      telefono,
      etiquetas,
      id_solicitud,
      direccion,
      link_direccion,
      facebook,
      instagram,
      zona,
      horario_atencion,
      foto_portada,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO restaurante (
        nombre, horario, telefono, etiquetas, id_solicitud, id_usuario,
        direccion, link_direccion, facebook, instagram, zona, horario_atencion, foto_portada
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        nombre, horario, telefono, etiquetas, id_solicitud, req.userId,
        direccion, link_direccion, facebook, instagram, zona, horario_atencion, foto_portada
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear restaurante',
    });
  }
});

// Actualizar restaurante
app.put('/api/restaurantes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      horario,
      telefono,
      etiquetas,
      direccion,
      link_direccion,
      facebook,
      instagram,
      zona,
      horario_atencion,
      foto_portada,
    } = req.body;

    // Verificar permisos
    const restaurante = await pool.query(
      'SELECT id_usuario FROM restaurante WHERE id_restaurante = $1',
      [id]
    );

    if (restaurante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurante no encontrado',
      });
    }

    if (restaurante.rows[0].id_usuario !== req.userId && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar este restaurante',
      });
    }

    const result = await pool.query(
      `UPDATE restaurante SET
        nombre = $1, horario = $2, telefono = $3, etiquetas = $4,
        direccion = $5, link_direccion = $6, facebook = $7, instagram = $8,
        zona = $9, horario_atencion = $10, foto_portada = $11
       WHERE id_restaurante = $12
       RETURNING *`,
      [nombre, horario, telefono, etiquetas, direccion, link_direccion,
       facebook, instagram, zona, horario_atencion, foto_portada, id]
    );

    res.json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar restaurante',
    });
  }
});

// Eliminar restaurante
app.delete('/api/restaurantes/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM restaurante WHERE id_restaurante = $1 RETURNING id_restaurante, nombre',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurante no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Restaurante eliminado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar restaurante',
    });
  }
});

// Buscar restaurantes
app.get('/api/restaurantes/buscar', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda "q" requerido',
      });
    }

    const result = await pool.query(`
      SELECT * FROM restaurante
      WHERE 
        nombre ILIKE $1 OR
        etiquetas ILIKE $1 OR
        zona ILIKE $1 OR
        direccion ILIKE $1
      ORDER BY nombre
      LIMIT 20
    `, [`%${q}%`]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la búsqueda',
    });
  }
});

// Restaurantes por zona
app.get('/api/restaurantes/zona/:zona', async (req: Request, res: Response) => {
  try {
    const { zona } = req.params;
    const result = await pool.query(
      'SELECT * FROM restaurante WHERE zona = $1 ORDER BY nombre',
      [zona]
    );

    res.json({
      success: true,
      zona,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener restaurantes por zona',
    });
  }
});

// ==================== SOLICITUDES ====================

// Listar solicitudes
app.get('/api/solicitudes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { estado } = req.query;
    
    let query = `
      SELECT 
        s.*,
        u.nombre as nombre_usuario,
        u.correo as correo_usuario
      FROM solicitud_registro s
      LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
    `;
    
    const params: any[] = [];
    
    // Si no es admin, solo ver sus propias solicitudes
    if (req.userRole !== 1) {
      query += ` WHERE s.id_usuario = $1`;
      params.push(req.userId);
      
      if (estado) {
        query += ` AND s.estado = $2`;
        params.push(estado);
      }
    } else if (estado) {
      query += ` WHERE s.estado = $1`;
      params.push(estado);
    }
    
    query += ` ORDER BY s.fecha DESC`;
    
    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener solicitudes',
    });
  }
});

// Obtener solicitud por ID
app.get('/api/solicitudes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT 
        s.*,
        u.nombre as nombre_usuario,
        u.correo as correo_usuario
      FROM solicitud_registro s
      LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
      WHERE s.id_solicitud = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    // Verificar permisos
    if (req.userRole !== 1 && result.rows[0].id_usuario !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver esta solicitud',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener solicitud',
    });
  }
});

// Crear solicitud
app.post('/api/solicitudes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      nombre_propuesto_restaurante,
      correo,
      nombre_propietario,
      horario_atencion,
    } = req.body;

    if (!nombre_propuesto_restaurante || !correo || !nombre_propietario || !horario_atencion) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos',
      });
    }

    const result = await pool.query(
      `INSERT INTO solicitud_registro (
        fecha, estado, nombre_propuesto_restaurante, correo, nombre_propietario, horario_atencion, id_usuario
      ) VALUES (NOW(), 'Pendiente', $1, $2, $3, $4, $5)
      RETURNING *`,
      [nombre_propuesto_restaurante, correo, nombre_propietario, horario_atencion, req.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear solicitud',
    });
  }
});

// Actualizar solicitud
app.put('/api/solicitudes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nombre_propuesto_restaurante,
      correo,
      nombre_propietario,
      horario_atencion,
    } = req.body;

    // Verificar permisos
    const solicitud = await pool.query(
      'SELECT id_usuario FROM solicitud_registro WHERE id_solicitud = $1',
      [id]
    );

    if (solicitud.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.rows[0].id_usuario !== req.userId && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar esta solicitud',
      });
    }

    const result = await pool.query(
      `UPDATE solicitud_registro SET
        nombre_propuesto_restaurante = $1,
        correo = $2,
        nombre_propietario = $3,
        horario_atencion = $4
       WHERE id_solicitud = $5
       RETURNING *`,
      [nombre_propuesto_restaurante, correo, nombre_propietario, horario_atencion, id]
    );

    res.json({
      success: true,
      message: 'Solicitud actualizada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar solicitud',
    });
  }
});

// Eliminar solicitud
app.delete('/api/solicitudes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    const solicitud = await pool.query(
      'SELECT id_usuario FROM solicitud_registro WHERE id_solicitud = $1',
      [id]
    );

    if (solicitud.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    if (solicitud.rows[0].id_usuario !== req.userId && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta solicitud',
      });
    }

    const result = await pool.query(
      'DELETE FROM solicitud_registro WHERE id_solicitud = $1 RETURNING id_solicitud, nombre_propuesto_restaurante',
      [id]
    );

    res.json({
      success: true,
      message: 'Solicitud eliminada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar solicitud',
    });
  }
});

// Aprobar solicitud (solo admin)
app.patch('/api/solicitudes/:id/aprobar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE solicitud_registro SET estado = 'Aprobado' WHERE id_solicitud = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aprobar solicitud',
    });
  }
});

// Rechazar solicitud (solo admin)
app.patch('/api/solicitudes/:id/rechazar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE solicitud_registro SET estado = 'Rechazado' WHERE id_solicitud = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Solicitud rechazada',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar solicitud',
    });
  }
});

// Solicitudes pendientes (solo admin)
app.get('/api/solicitudes/estado/Pendiente', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        u.nombre as nombre_usuario,
        u.correo as correo_usuario
      FROM solicitud_registro s
      LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
      WHERE s.estado = 'Pendiente'
      ORDER BY s.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener solicitudes pendientes',
    });
  }
});

// ==================== REVISIONES ====================

// Listar revisiones (solo admin)
app.get('/api/revisiones', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        s.nombre_propuesto_restaurante,
        s.estado as estado_solicitud,
        u.nombre as nombre_revisor
      FROM revision_solicitud r
      LEFT JOIN solicitud_registro s ON r.id_solicitud = s.id_solicitud
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
      ORDER BY r.fecha DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener revisiones',
    });
  }
});

// Obtener revisión por ID
app.get('/api/revisiones/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        r.*,
        s.nombre_propuesto_restaurante,
        u.nombre as nombre_revisor
      FROM revision_solicitud r
      LEFT JOIN solicitud_registro s ON r.id_solicitud = s.id_solicitud
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
      WHERE r.id_revision = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Revisión no encontrada',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener revisión',
    });
  }
});

// Crear revisión (solo admin)
app.post('/api/revisiones', authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id_solicitud } = req.body;

    if (!id_solicitud) {
      return res.status(400).json({
        success: false,
        error: 'id_solicitud es requerido',
      });
    }

    const result = await pool.query(
      `INSERT INTO revision_solicitud (fecha, id_solicitud, id_usuario)
       VALUES (NOW(), $1, $2)
       RETURNING *`,
      [id_solicitud, req.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Revisión creada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear revisión',
    });
  }
});

// Revisiones por solicitud
app.get('/api/revisiones/solicitud/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        r.*,
        u.nombre as nombre_revisor
      FROM revision_solicitud r
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
      WHERE r.id_solicitud = $1
      ORDER BY r.fecha DESC
    `, [id]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener revisiones',
    });
  }
});

// ==================== COMPROBANTES ====================

// Listar comprobantes
app.get('/api/comprobantes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let query = `
      SELECT 
        c.*,
        r.nombre as nombre_restaurante,
        s.nombre_propuesto_restaurante,
        u.nombre as nombre_usuario
      FROM comprobante c
      LEFT JOIN restaurante r ON c.id_restaurante = r.id_restaurante
      LEFT JOIN solicitud_registro s ON c.id_solicitud = s.id_solicitud
      LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
    `;
    
    const params: any[] = [];
    
    // Si no es admin, solo ver sus propios comprobantes
    if (req.userRole !== 1) {
      query += ` WHERE c.id_usuario = $1`;
      params.push(req.userId);
    }
    
    query += ` ORDER BY c.fecha_subida DESC`;
    
    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comprobantes',
    });
  }
});

// Obtener comprobante por ID
app.get('/api/comprobantes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        c.*,
        r.nombre as nombre_restaurante,
        u.nombre as nombre_usuario
      FROM comprobante c
      LEFT JOIN restaurante r ON c.id_restaurante = r.id_restaurante
      LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_comprobante = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comprobante no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comprobante',
    });
  }
});

// Crear comprobante
app.post('/api/comprobantes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id_comprobante, tipo, ruta_archivo, id_restaurante, id_solicitud } = req.body;

    if (!id_comprobante || !tipo || !ruta_archivo) {
      return res.status(400).json({
        success: false,
        error: 'id_comprobante, tipo y ruta_archivo son requeridos',
      });
    }

    const result = await pool.query(
      `INSERT INTO comprobante (id_comprobante, tipo, ruta_archivo, fecha_subida, id_restaurante, id_solicitud, id_usuario)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6)
       RETURNING *`,
      [id_comprobante, tipo, ruta_archivo, id_restaurante, id_solicitud, req.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Comprobante creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear comprobante',
    });
  }
});

// Eliminar comprobante
app.delete('/api/comprobantes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    const comprobante = await pool.query(
      'SELECT id_usuario FROM comprobante WHERE id_comprobante = $1',
      [id]
    );

    if (comprobante.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comprobante no encontrado',
      });
    }

    if (comprobante.rows[0].id_usuario !== req.userId && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este comprobante',
      });
    }

    const result = await pool.query(
      'DELETE FROM comprobante WHERE id_comprobante = $1 RETURNING id_comprobante, tipo',
      [id]
    );

    res.json({
      success: true,
      message: 'Comprobante eliminado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar comprobante',
    });
  }
});

// Comprobantes por solicitud
app.get('/api/comprobantes/solicitud/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM comprobante WHERE id_solicitud = $1 ORDER BY fecha_subida DESC',
      [id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comprobantes',
    });
  }
});

// Comprobantes por restaurante
app.get('/api/comprobantes/restaurante/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM comprobante WHERE id_restaurante = $1 ORDER BY fecha_subida DESC',
      [id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comprobantes',
    });
  }
});

// ==================== MENÚS ====================

// Listar menús
app.get('/api/menus', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        r.nombre as nombre_restaurante,
        u.nombre as nombre_usuario
      FROM menu m
      LEFT JOIN restaurante r ON m.id_restaurante = r.id_restaurante
      LEFT JOIN usuario u ON m.id_usuario = u.id_usuario
      ORDER BY m.id_menu DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener menús',
    });
  }
});

// Obtener menú por ID
app.get('/api/menus/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.*,
        r.nombre as nombre_restaurante,
        u.nombre as nombre_usuario
      FROM menu m
      LEFT JOIN restaurante r ON m.id_restaurante = r.id_restaurante
      LEFT JOIN usuario u ON m.id_usuario = u.id_usuario
      WHERE m.id_menu = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menú no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener menú',
    });
  }
});

// Crear menú
app.post('/api/menus', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { ruta_archivo, id_restaurante } = req.body;

    if (!ruta_archivo || !id_restaurante) {
      return res.status(400).json({
        success: false,
        error: 'ruta_archivo y id_restaurante son requeridos',
      });
    }

    const result = await pool.query(
      `INSERT INTO menu (ruta_archivo, id_restaurante, id_usuario, contador_descargas)
       VALUES ($1, $2, $3, 0)
       RETURNING *`,
      [ruta_archivo, id_restaurante, req.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Menú creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear menú',
    });
  }
});

// Eliminar menú
app.delete('/api/menus/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    const menu = await pool.query(
      'SELECT id_usuario FROM menu WHERE id_menu = $1',
      [id]
    );

    if (menu.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menú no encontrado',
      });
    }

    if (menu.rows[0].id_usuario !== req.userId && req.userRole !== 1) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este menú',
      });
    }

    const result = await pool.query(
      'DELETE FROM menu WHERE id_menu = $1 RETURNING id_menu, ruta_archivo',
      [id]
    );

    res.json({
      success: true,
      message: 'Menú eliminado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar menú',
    });
  }
});

// Menús por restaurante
app.get('/api/menus/restaurante/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM menu WHERE id_restaurante = $1 ORDER BY id_menu DESC',
      [id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener menús',
    });
  }
});

// Incrementar contador de descargas
app.patch('/api/menus/:id/descargar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      UPDATE menu 
      SET contador_descargas = contador_descargas + 1
      WHERE id_menu = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menú no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Descarga registrada',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar descargas',
    });
  }
});

// ==================== FAVORITOS ====================

// Obtener favoritos del usuario autenticado
app.get('/api/favoritos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.*,
        r.nombre as nombre_restaurante,
        r.zona,
        r.foto_portada,
        r.etiquetas,
        r.horario_atencion
      FROM favoritos f
      LEFT JOIN restaurante r ON f.id_restaurante = r.id_restaurante
      WHERE f.id_usuario = $1
      ORDER BY f.fecha_favorito DESC
    `, [req.userId]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos',
    });
  }
});

// Agregar a favoritos
app.post('/api/favoritos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id_restaurante } = req.body;

    if (!id_restaurante) {
      return res.status(400).json({
        success: false,
        error: 'id_restaurante es requerido',
      });
    }

    // Verificar si ya existe
    const existing = await pool.query(
      'SELECT * FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2',
      [req.userId, id_restaurante]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El restaurante ya está en favoritos',
      });
    }

    const result = await pool.query(
      `INSERT INTO favoritos (id_usuario, id_restaurante, fecha_favorito)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [req.userId, id_restaurante]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurante agregado a favoritos',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar a favoritos',
    });
  }
});

// Eliminar de favoritos
app.delete('/api/favoritos/:restauranteId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { restauranteId } = req.params;

    const result = await pool.query(
      'DELETE FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2 RETURNING *',
      [req.userId, restauranteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorito no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Restaurante eliminado de favoritos',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar de favoritos',
    });
  }
});

// Verificar si un restaurante es favorito
app.get('/api/favoritos/check/:restauranteId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { restauranteId } = req.params;

    const result = await pool.query(
      'SELECT * FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2',
      [req.userId, restauranteId]
    );

    res.json({
      success: true,
      isFavorite: result.rows.length > 0,
      data: result.rows.length > 0 ? result.rows[0] : null,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar favorito',
    });
  }
});

// ==================== ROLES ====================

// Listar roles
app.get('/api/roles', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rol ORDER BY id_rol');

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener roles',
    });
  }
});

// Obtener rol por ID
app.get('/api/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM rol WHERE id_rol = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener rol',
    });
  }
});

// ==================== ERROR HANDLERS ====================

// Ruta 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handler global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ==================== INICIO DEL SERVIDOR ====================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🍽️  API SAZON PATRIMONIAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Modo:', process.env.NODE_ENV || 'development');
  console.log('📡 Puerto:', PORT);
  console.log('🗄️  Base de datos:', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log('🔗 URL:', `http://localhost:${PORT}`);
  console.log('📖 Docs:', `http://localhost:${PORT}/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Servidor listo para recibir peticiones\n');
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});