import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Faltan las siguientes variables de entorno:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Asegúrate de tener un archivo .env con todas las variables requeridas.');
  console.error('   Ejemplo de Cloudinary: https://cloudinary.com/console\n');
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas correctamente.');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configurado correctamente.');

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

// Configuración de Multer (almacenamiento temporal en memoria)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware para capturar las 3 fotos y el PDF
const uploadFields = upload.fields([
  { name: 'foto_portada', maxCount: 1 },
  { name: 'foto_2', maxCount: 1 },
  { name: 'foto_3', maxCount: 1 },
  { name: 'menu_pdf', maxCount: 1 }
]);

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

// LOGIN (Soporta contraseñas encriptadas y en texto plano)
app.post('/api/login', async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
    const user = result.rows[0];

    // 1. Validar si el correo existe
    if (!user) {
      return res.status(401).json({ success: false, message: 'El correo no existe en la base de datos' });
    }

    // 2. Validar la contraseña (primero en texto plano, luego con bcrypt)
    let isMatch = (user.contrasena === contrasena);
    
    if (!isMatch) {
      // Si no coinciden exactamente, intentamos desencriptarla
      isMatch = await bcrypt.compare(contrasena, user.contrasena);
    }

    if (isMatch) { 
      // ¡ÉXITO!
      const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token, user: { id: user.id_usuario, nombre: user.nombre, role: user.id_rol } });
    } else {
      // CONTRASEÑA MAL
      res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ success: false, error: 'Error en el servidor durante el login' });
  }
});

// REGISTRO DE USUARIO (Cliente)
app.post('/api/auth/client/register', async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contrasena, id_rol } = req.body;

    console.log('📝 Solicitud de registro recibida:', { nombre, correo, id_rol });

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios',
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await pool.query('SELECT * FROM usuario WHERE correo = $1', [correo]);

    if (usuarioExistente.rows.length > 0) {
      console.log('❌ Correo ya registrado:', correo);
      return res.status(400).json({
        success: false,
        error: 'Este correo ya está registrado',
      });
    }

    // Hash de la contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    console.log('💾 Creando usuario en la base de datos...');
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuario (nombre, correo, contrasena, id_rol, foto_evidencia) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id_usuario, nombre, correo, id_rol, foto_evidencia`,
      [nombre, correo, hashedPassword, id_rol || 3, null]
    );

    const user = nuevoUsuario.rows[0];
    console.log('✅ Usuario creado exitosamente:', user.id_usuario);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        role: user.id_rol,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Obtener nombre del rol
    const rolResult = await pool.query('SELECT nombre_rol FROM rol WHERE id_rol = $1', [user.id_rol]);
    const nombreRol = rolResult.rows[0]?.nombre_rol || 'Usuario';

    console.log('🎉 Registro completado exitosamente');

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.id_rol,
          nombre_rol: nombreRol,
          foto_evidencia: user.foto_evidencia,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

// OBTENER SOLICITUDES PENDIENTES (Admin)
app.get('/api/solicitudes/estado/Pendiente', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id_solicitud,
        s.nombre_propuesto_restaurante as restaurante,
        s.nombre_propietario as propietario,
        s.correo,
        s.horario_atencion as horario,
        s.direccion,
        s.telefono,
        s.foto_portada,
        s.foto_2,
        s.foto_3,
        s.menu_pdf as pdf_url, -- ✅ AQUÍ SE ENVÍA EL PDF
        u.id_usuario
      FROM solicitud_registro s
      LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
      WHERE s.estado = 'Pendiente'
      ORDER BY s.fecha DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
  }
});

// ============================================
// 1️⃣ OBTENER MI RESTAURANTE (Restaurantero)
// ============================================
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

// ============================================
// 2️⃣ GUARDAR BORRADOR (Auto-guardado sin validación)
// ============================================
app.put('/api/mi-restaurante/draft', authenticateToken, uploadFields, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

    console.log(`💾 Auto-guardando borrador para Usuario ID: ${userId}`);

    const { 
      nombre, 
      direccion, 
      horario, 
      telefono, 
      facebook, 
      instagram, 
      etiquetas 
    } = req.body;

    // 🔥 SUBIR A CLOUDINARY (si hay archivos nuevos)
    const foto_portada_url = files['foto_portada'] 
      ? await uploadToCloudinary(files['foto_portada'][0].buffer, 'restaurantes')
      : req.body.foto_portada;

    const foto_2_url = files['foto_2'] 
      ? await uploadToCloudinary(files['foto_2'][0].buffer, 'restaurantes')
      : req.body.foto_2;

    const foto_3_url = files['foto_3'] 
      ? await uploadToCloudinary(files['foto_3'][0].buffer, 'restaurantes')
      : req.body.foto_3;

    const menu_pdf_url = files['menu_pdf'] 
      ? await uploadToCloudinary(files['menu_pdf'][0].buffer, 'menus', 'raw')
      : req.body.menu_pdf;

    // 1. Obtener datos del usuario
    const userQuery = 'SELECT nombre, correo FROM usuario WHERE id_usuario = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const usuario = userResult.rows[0];
    const nombrePropietario = usuario.nombre || 'Propietario Desconocido';
    const correoPropietario = usuario.correo || 'sin_correo@ejemplo.com';

    // 2. Verificar si ya existe una solicitud
    const checkQuery = 'SELECT id_solicitud, estado FROM solicitud_registro WHERE id_usuario = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length > 0) {
      // ✅ ACTUALIZAR BORRADOR (mantiene el estado actual)
      const estadoActual = checkResult.rows[0].estado;
      
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
          fecha = NOW()
        WHERE id_usuario = $12
      `;
      
      await pool.query(updateQuery, [
        nombre, direccion, horario, telefono, facebook, instagram, etiquetas, 
        foto_portada_url, foto_2_url, foto_3_url, menu_pdf_url, userId
      ]);

      console.log(`✅ Borrador actualizado (estado: ${estadoActual})`);
    } else {
      // ✅ CREAR BORRADOR INICIAL (estado: "Borrador")
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), 'Borrador')
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
        foto_portada_url,
        foto_2_url,
        foto_3_url,
        menu_pdf_url
      ]);

      console.log(`✅ Borrador inicial creado`);
    }

    res.json({ success: true, message: 'Borrador guardado automáticamente' });

  } catch (error: any) {
    console.error('❌ Error guardando borrador:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 3️⃣ ENVIAR A REVISIÓN (Solo cuando el usuario hace clic en "Aplicar Cambios")
// ============================================
app.put('/api/mi-restaurante/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    console.log(`📤 Enviando solicitud a revisión para Usuario ID: ${userId}`);

    // Cambiar el estado a "Pendiente" para que el admin la vea
    const updateQuery = `
      UPDATE solicitud_registro 
      SET estado = 'Pendiente', fecha = NOW()
      WHERE id_usuario = $1
    `;

    await pool.query(updateQuery, [userId]);

    res.json({ 
      success: true, 
      message: 'Solicitud enviada a revisión exitosamente' 
    });

  } catch (error: any) {
    console.error('❌ Error enviando a revisión:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GUARDAR/ACTUALIZAR RESTAURANTE (Restaurantero) - CON SUBIDA DE ARCHIVOS
app.put('/api/mi-restaurante', authenticateToken, uploadFields, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

    // --- SUBIDA A CLOUDINARY ---
    const foto_portada_url = files['foto_portada'] ? await uploadToCloudinary(files['foto_portada'][0].buffer, 'restaurantes') : req.body.foto_portada;
    const foto_2_url = files['foto_2'] ? await uploadToCloudinary(files['foto_2'][0].buffer, 'restaurantes') : req.body.foto_2;
    const foto_3_url = files['foto_3'] ? await uploadToCloudinary(files['foto_3'][0].buffer, 'restaurantes') : req.body.foto_3;
    const menu_pdf_url = files['menu_pdf'] ? await uploadToCloudinary(files['menu_pdf'][0].buffer, 'menus', 'raw') : req.body.menu_pdf;

    console.log(`🔹 Guardando/Actualizando datos para Usuario ID: ${userId}`);

    const { 
      nombre, 
      direccion,
      horario, 
      telefono, 
      facebook, 
      instagram, 
      etiquetas
    } = req.body;

    // 1. Obtener datos OBLIGATORIOS del usuario
    const userQuery = 'SELECT nombre, correo FROM usuario WHERE id_usuario = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado en la base de datos' });
    }

    const usuario = userResult.rows[0];
    const nombrePropietario = usuario.nombre || 'Propietario Desconocido';
    const correoPropietario = usuario.correo || 'sin_correo@ejemplo.com';

    // 2. Verificar si el usuario YA TIENE UN RESTAURANTE APROBADO en la tabla `restaurante`
    const checkRestauranteQuery = 'SELECT id_restaurante FROM restaurante WHERE id_usuario = $1';
    const checkRestauranteResult = await pool.query(checkRestauranteQuery, [userId]);

    if (checkRestauranteResult.rows.length > 0) {
      // =========================================================================
      // CASO A: YA FUE APROBADO ANTERIORMENTE. ACTUALIZAMOS DIRECTO EL RESTAURANTE.
      // =========================================================================
      console.log(`✅ Actualizando directamente el Restaurante para Usuario ID: ${userId}`);
      const idRestaurante = checkRestauranteResult.rows[0].id_restaurante;

      const updateRestauranteQuery = `
        UPDATE restaurante SET
          nombre = $1,
          link_direccion = $2,
          horario_atencion = $3,
          telefono = $4,
          facebook = $5,
          instagram = $6,
          etiquetas = $7,
          foto_portada = $8
        WHERE id_restaurante = $9
      `;
      
      await pool.query(updateRestauranteQuery, [
        nombre, direccion, horario, telefono, facebook, instagram, etiquetas, 
        foto_portada_url, idRestaurante
      ]);

      // También actualizamos la solicitud original para mantener las fotos 2, 3 y el PDF sincronizados
      const updateSolicitudAprobadaQuery = `
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
          fecha = NOW()
        WHERE id_usuario = $12
      `;
      await pool.query(updateSolicitudAprobadaQuery, [
        nombre, direccion, horario, telefono, facebook, instagram, etiquetas, 
        foto_portada_url, foto_2_url, foto_3_url, menu_pdf_url, userId
      ]);

      return res.json({ success: true, message: 'Cambios aplicados automáticamente al restaurante.' });

    } else {
      // =========================================================================
      // CASO B: ES NUEVO O RECHAZADO. ACTUALIZAMOS LA SOLICITUD Y PASA A PENDIENTE.
      // =========================================================================
      const checkSolicitudQuery = 'SELECT id_solicitud FROM solicitud_registro WHERE id_usuario = $1';
      const checkSolicitudResult = await pool.query(checkSolicitudQuery, [userId]);

      if (checkSolicitudResult.rows.length > 0) {
        console.log(`🔸 Actualizando solicitud existente y pasando a Pendiente...`);
        
        const updateSolicitudQuery = `
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
        
        await pool.query(updateSolicitudQuery, [
          nombre, direccion, horario, telefono, facebook, instagram, etiquetas, 
          foto_portada_url, foto_2_url, foto_3_url, menu_pdf_url, userId
        ]);
      } else {
        console.log(`🆕 Creando nueva solicitud en estado Pendiente`);

        const insertQuery = `
          INSERT INTO solicitud_registro (
            id_usuario, nombre_propuesto_restaurante, correo, nombre_propietario,
            direccion, horario_atencion, telefono, facebook, instagram, etiquetas, 
            foto_portada, foto_2, foto_3, menu_pdf, fecha, estado
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), 'Pendiente')
        `;

        await pool.query(insertQuery, [
          userId, nombre, correoPropietario, nombrePropietario, direccion, horario, 
          telefono, facebook, instagram, etiquetas, foto_portada_url, foto_2_url, foto_3_url, menu_pdf_url
        ]);
      }

      return res.json({ success: true, message: 'Solicitud enviada a revisión exitosamente.' });
    }

  } catch (error: any) {
    console.error('❌ Error al procesar archivos:', error);
    res.status(500).json({ success: false, error: error.message });
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

// ============================================
// OBTENER RESTAURANTES PÚBLICOS (Vista principal)
// ============================================
app.get('/api/restaurantes', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_restaurante,
        r.nombre as restaurante,
        r.telefono,
        r.link_direccion as direccion,
        r.horario_atencion as horario,
        r.foto_portada,
        s.foto_2,
        s.foto_3,
        s.menu_pdf as pdf_url,
        s.etiquetas
      FROM restaurante r
      LEFT JOIN solicitud_registro s ON r.id_solicitud = s.id_solicitud
      ORDER BY r.id_restaurante DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo restaurantes públicos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener restaurantes' });
  }
});

// ============================================
// OBTENER RESTAURANTES ACTIVOS (Admin)
// ============================================
app.get('/api/admin/restaurantes', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_restaurante,
        r.nombre as restaurante,
        u.nombre as propietario,
        u.correo,
        r.telefono,
        r.link_direccion as direccion,
        r.horario_atencion as horario,
        r.foto_portada,
        s.foto_2,
        s.foto_3,
        s.menu_pdf as pdf_url
      FROM restaurante r
      LEFT JOIN usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN solicitud_registro s ON r.id_solicitud = s.id_solicitud
      ORDER BY r.id_restaurante DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo restaurantes activos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener restaurantes' });
  }
});

// ============================================
// ELIMINAR RESTAURANTE (Admin)
// ============================================
app.delete('/api/admin/restaurantes/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // 1. Encontrar la solicitud asociada
    const restRes = await client.query('SELECT id_solicitud FROM restaurante WHERE id_restaurante = $1', [id]);
    if (restRes.rows.length > 0) {
      const idSolicitud = restRes.rows[0].id_solicitud;
      // Regresar el estado de la solicitud para que el restaurantero sepa que fue rechazado/borrado
      await client.query("UPDATE solicitud_registro SET estado = 'Rechazado' WHERE id_solicitud = $1", [idSolicitud]);
    }

    // 2. Eliminar de la tabla de restaurantes
    await client.query('DELETE FROM restaurante WHERE id_restaurante = $1', [id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Restaurante eliminado correctamente' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Error eliminando restaurante:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// 🔥 FUNCIÓN AUXILIAR: Subir a Cloudinary
// ============================================
async function uploadToCloudinary(fileBuffer: Buffer, folder: string, resourceType: 'image' | 'raw' = 'image'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sazon-patrimonial/${folder}`,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          console.error('Error subiendo a Cloudinary:', error);
          reject(new Error('Error al subir archivo'));
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
