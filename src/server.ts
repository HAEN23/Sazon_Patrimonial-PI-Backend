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
      const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '50d' });
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

// ============================================
// REGISTRO DE USUARIOS (General)
// ============================================
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const clientDB = await pool.connect();
  try {
    await clientDB.query('BEGIN');
    const { nombre, correo, contrasena, id_rol } = req.body;

    // 1. Verificar si el correo ya existe
    const userExists = await clientDB.query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) {
      throw new Error('El correo ya está registrado');
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 3. Insertar en la tabla principal (usuario)
    const insertUserQuery = `
      INSERT INTO usuario (nombre, correo, contrasena, id_rol) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_usuario
    `;
    const userResult = await clientDB.query(insertUserQuery, [nombre, correo, hashedPassword, id_rol]);
    const nuevoIdUsuario = userResult.rows[0].id_usuario;

    // 4. Crear registro en tabla hija según el rol usando "userId" (como lo define Prisma)
    if (id_rol === 2 || id_rol === '2') { // Es Restaurantero
      const insertOwnerQuery = `
        INSERT INTO restaurant_owner ("userId", "createdAt") 
        VALUES ($1, NOW())
      `;
      await clientDB.query(insertOwnerQuery, [nuevoIdUsuario]);
      console.log(`✅ Restaurantero guardado en tabla 'restaurant_owner' con userId: ${nuevoIdUsuario}`);

    } else if (id_rol === 3 || id_rol === '3') { // Es Cliente
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
});

// ============================================
// REGISTRO DE USUARIO (Cliente / Restaurantero desde el Frontend)
// ============================================
app.post('/api/auth/client/register', async (req: Request, res: Response) => {
  const clientDB = await pool.connect();
  try {
    await clientDB.query('BEGIN');
    const { nombre, correo, contrasena, id_rol } = req.body;

    console.log('📝 Solicitud de registro recibida:', { nombre, correo, id_rol });

    if (!nombre || !correo || !contrasena) {
      throw new Error('Todos los campos son obligatorios');
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await clientDB.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
    if (usuarioExistente.rows.length > 0) {
      throw new Error('Este correo ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario en tabla principal
    const rolAsignado = id_rol || 3; // Por defecto es 3 (Cliente)
    const nuevoUsuario = await clientDB.query(
      `INSERT INTO usuario (nombre, correo, contrasena, id_rol, foto_evidencia) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id_usuario, nombre, correo, id_rol`,
      [nombre, correo, hashedPassword, rolAsignado, null]
    );

    const user = nuevoUsuario.rows[0];

    // Insertar en la tabla hija correspondiente según Prisma ("userId")
    if (rolAsignado === 2 || rolAsignado === '2') {
      await clientDB.query(`INSERT INTO restaurant_owner ("userId", "createdAt") VALUES ($1, NOW())`, [user.id_usuario]);
      console.log(`✅ Restaurantero creado exitosamente en 'restaurant_owner'`);
    } else if (rolAsignado === 3 || rolAsignado === '3') {
      await clientDB.query(`INSERT INTO client ("userId", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW())`, [user.id_usuario]);
      console.log(`✅ Cliente creado exitosamente en 'client'`);
    }

    await clientDB.query('COMMIT');

    const token = jwt.sign({ id: user.id_usuario, role: user.id_rol }, JWT_SECRET, { expiresIn: '50d' });
    
    // Obtener nombre del rol para la respuesta
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

// ============================================
// APROBAR SOLICITUD (Admin)
// ============================================
app.patch('/api/solicitudes/:id/aprobar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const adminId = (req as any).user.id; // Extraemos el ID del Admin que hizo la acción

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
    
    const nuevoRest = await client.query(insertRest, [
      sol.nombre_propuesto_restaurante,
      sol.id_usuario, // Este es el ID del dueño del restaurante
      sol.id_solicitud,
      sol.direccion, 
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

    // 4. NUEVO: Insertar el registro en la tabla de revision_solicitud
    // Como tu base de datos espera un String en la fecha (VarChar), le pasamos un toLocaleString()
    const fechaRevision = new Date().toLocaleString('es-MX'); 
    await client.query(
      "INSERT INTO revision_solicitud (fecha, id_solicitud, id_usuario) VALUES ($1, $2, $3)",
      [fechaRevision, id, adminId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Restaurante aprobado y creado. Revisión registrada.' });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error aprobando:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// RECHAZAR SOLICITUD (Admin)
// ============================================
app.patch('/api/solicitudes/:id/rechazar', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const adminId = (req as any).user.id; // Extraemos el ID del Admin

    // 1. Cambiar estado de la solicitud a "Rechazado"
    await client.query("UPDATE solicitud_registro SET estado = 'Rechazado' WHERE id_solicitud = $1", [id]);

    // 2. NUEVO: Insertar el registro en la tabla de revision_solicitud
    const fechaRevision = new Date().toLocaleString('es-MX');
    await client.query(
      "INSERT INTO revision_solicitud (fecha, id_solicitud, id_usuario) VALUES ($1, $2, $3)",
      [fechaRevision, id, adminId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Solicitud rechazada y revisión registrada.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error rechazando:', error);
    res.status(500).json({ success: false, error: 'Error al rechazar' });
  } finally {
    client.release();
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
// OBTENER UN RESTAURANTE ESPECÍFICO POR ID
// ============================================
app.get('/api/restaurantes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        r.id_restaurante,
        r.nombre,
        r.telefono,
        r.link_direccion as direccion,
        r.horario_atencion,
        r.facebook,
        r.instagram,
        r.foto_portada,
        s.foto_2,
        s.foto_3,
        s.menu_pdf as pdf_url,
        s.etiquetas
      FROM restaurante r
      LEFT JOIN solicitud_registro s ON r.id_solicitud = s.id_solicitud
      WHERE r.id_restaurante = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error obteniendo el restaurante individual:', error);
    res.status(500).json({ success: false, error: 'Error al obtener el restaurante' });
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

// ============================================
// FAVORITOS
// ============================================

// 1. Alternar Favorito (Agregar o Quitar)
app.post('/api/favorites/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id_restaurante } = req.body;

    // 1. Verificar el rol del usuario desde la base de datos (La fuente de la verdad)
    const usuarioBD = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    
    if (usuarioBD.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // 2. Verificar que NO sea Restaurantero (rol 2)
    if (usuarioBD.rows[0].id_rol === 2) {
      return res.status(403).json({ 
        success: false, 
        message: 'Los restauranteros no pueden dar likes.' 
      });
    }

    // 3. Si es Cliente (rol 3) o Admin (rol 1), puede dar like
    // Verificar si ya está en favoritos
    const checkResult = await pool.query(
      'SELECT * FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2', 
      [userId, id_restaurante]
    );

    if (checkResult.rows.length > 0) {
      // Si ya es favorito, lo eliminamos
      await pool.query('DELETE FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2', [userId, id_restaurante]);
      res.json({ success: true, message: 'Removido de favoritos', isFavorite: false });
    } else {
      // ✅ AHORA SÍ: Insertamos el registro incluyendo la fecha actual (CURRENT_DATE)
      await pool.query(
        'INSERT INTO favoritos (id_usuario, id_restaurante, fecha_favorito) VALUES ($1, $2, CURRENT_DATE)', 
        [userId, id_restaurante]
      );
      res.json({ success: true, message: 'Agregado a favoritos', isFavorite: true });
    }
  } catch (error) {
    // Esto imprimirá el error real en la terminal de tu backend por si llega a fallar algo más
    console.error('Error en favoritos:', error); 
    res.status(500).json({ success: false, error: 'Error procesando favorito' });
  }
});

// 2. Comprobar si un restaurante ya es favorito (Para la persistencia)
app.get('/api/favorites/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id_restaurante } = req.query;

    const checkResult = await pool.query(
      'SELECT * FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2', 
      [userId, id_restaurante]
    );

    res.json({ success: true, isFavorite: checkResult.rows.length > 0 });
  } catch (error) {
    console.error('Error verificando favorito:', error);
    res.status(500).json({ success: false, error: 'Error verificando favorito' });
  }
});

// ============================================
// FOTOS DE USUARIOS
// ============================================

// 1. Subir Foto (Requiere Token y haber dado Like)
app.post('/api/photos', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.body.restaurantId;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, error: 'No se detectó ninguna imagen' });
    if (!restaurantId) return res.status(400).json({ success: false, error: 'Falta el ID del restaurante' });

    // 🔒 1. VERIFICAR EL ROL EN LA BASE DE DATOS
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    const usuario = usuarioQuery.rows[0];

    if (usuario && usuario.id_rol === 2) {
      return res.status(403).json({ 
        success: false, 
        message: "Acción denegada: Los restauranteros no pueden subir fotos como clientes." 
      });
    }

    // REGLA: Verificar si el usuario ya le dio a Favoritos
    const likeCheck = await pool.query(
      'SELECT * FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2',
      [userId, restaurantId]
    );

    if (likeCheck.rows.length === 0) {
       return res.status(403).json({ success: false, error: 'Debes darle a Favoritos (Like) antes de subir una foto.' });
    }

    // Subir a Cloudinary
    const fotoUrl = await uploadToCloudinary(file.buffer, 'fotos_usuarios');

    // Guardar en la Base de Datos
    await pool.query(
      'INSERT INTO foto_usuario (id_usuario, id_restaurante, url_foto, fecha_subida) VALUES ($1, $2, $3, CURRENT_DATE)',
      [userId, restaurantId, fotoUrl]
    );

    res.json({ success: true, url: fotoUrl });
  } catch (error) {
    console.error('Error subiendo foto de usuario:', error);
    res.status(500).json({ success: false, error: 'Error interno al guardar la foto' });
  }
});

// 2. Obtener todas las fotos de un restaurante
app.get('/api/photos/restaurant/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT url_foto as url FROM foto_usuario WHERE id_restaurante = $1 ORDER BY fecha_subida DESC', 
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error obteniendo fotos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener fotos' });
  }
});

// 3. Verificar si puede subir fotos (Para validación previa)
app.get('/api/restaurants/:id/photos/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    const usuario = usuarioQuery.rows[0];

    // Si es restaurantero, lanzamos el error
    if (usuario && usuario.id_rol === 2) {
      return res.status(403).json({ 
        success: false, 
        message: "Como Restaurantero, no puedes subir fotos como si fueras cliente." 
      });
    }

    // Si es cliente, le damos luz verde
    res.json({ success: true, message: "Puedes subir fotos." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ============================================
// ESTADÍSTICAS DEL RESTAURANTE
// ============================================
app.get('/api/restaurants/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. 💖 CONTAR LOS LIKES REALES DEL RESTAURANTE
    const likesQuery = await pool.query(
      'SELECT COUNT(*) as total_likes FROM favoritos WHERE id_restaurante = $1',
      [id]
    );
    // Extraemos el número de la base de datos (y lo convertimos a número entero)
    const totalLikes = parseInt(likesQuery.rows[0].total_likes, 10) || 0;

    // 2. (OPCIONAL) Contar las respuestas de la encuesta, si ya tienes esa tabla
    // const encuestasQuery = await pool.query('SELECT COUNT(*) as total FROM encuestas WHERE id_restaurante = $1', [id]);
    // const totalEncuestas = parseInt(encuestasQuery.rows[0].total, 10) || 0;

    // 3. Enviamos los datos reales al Frontend para que dibuje la gráfica
    res.json({
      success: true,
      data: {
        likes: totalLikes, // 👈 ¡Aquí mandamos los likes reales!
        descargasMenu: 0,  // Puedes cambiar esto después cuando cuentes descargas
        respuestasEncuesta: 0, // totalEncuestas
        statsAspectos: [0, 0, 0, 0, 0],
        statsRecomendacion: [0, 0, 0, 0, 0]
      }
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ============================================
// REGISTRAR CLIC/DESCARGA DE MENÚ
// ============================================
app.post('/api/restaurants/:id/menu/click', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificamos si ya existe un registro de menú para este restaurante
    const menuCheck = await pool.query('SELECT id_menu FROM menu WHERE id_restaurante = $1', [id]);

    if (menuCheck.rows.length > 0) {
      // Si existe, le sumamos 1 a la columna contador_descargas
      await pool.query('UPDATE menu SET contador_descargas = contador_descargas + 1 WHERE id_restaurante = $1', [id]);
    } else {
      // Si no existe, buscamos al dueño del restaurante para crear el registro inicial
      const restResult = await pool.query('SELECT id_usuario FROM restaurante WHERE id_restaurante = $1', [id]);
      
      if (restResult.rows.length > 0) {
         const idUsuario = restResult.rows[0].id_usuario;
         // Insertamos el menú con el contador en 1
         await pool.query(
           'INSERT INTO menu (id_restaurante, id_usuario, contador_descargas, ruta_archivo) VALUES ($1, $2, 1, $3)', 
           [id, idUsuario, 'Menú incrustado']
         );
      }
    }
    
    res.json({ success: true, message: 'Descarga registrada exitosamente' });
  } catch (error) {
    console.error('Error registrando descarga:', error);
    res.status(500).json({ success: false, error: 'Error al registrar descarga' });
  }
});

// ============================================
// ENCUESTAS
// ============================================

// 1. Verificar si el usuario ya respondió (Para bloquear el botón)
app.get('/api/restaurants/:id/survey/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.params.id;

    // 🔒 VERIFICAR EL ROL EN LA BASE DE DATOS
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    const usuario = usuarioQuery.rows[0];

    // Si es restaurantero, lo rebotamos desde la verificación
    if (usuario && usuario.id_rol === 2) {
      return res.status(403).json({ 
        success: false, 
        message: "Como Restaurantero, no puedes responder encuestas de satisfacción." 
      });
    }

    const checkResult = await pool.query(
      'SELECT id_encuesta FROM encuesta_restaurante WHERE id_usuario = $1 AND id_restaurante = $2',
      [userId, restaurantId]
    );

    res.json({ success: true, hasAnswered: checkResult.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error verificando encuesta' });
  }
});

// 2. Guardar que el usuario ya respondió
app.post('/api/restaurants/:id/survey', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.params.id;

    // 🔒 1. VERIFICAR EL ROL EN LA BASE DE DATOS
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    const usuario = usuarioQuery.rows[0];

    if (usuario && usuario.id_rol === 2) {
      return res.status(403).json({ 
        success: false, 
        message: "Acción denegada: Los restauranteros no pueden responder encuestas." 
      });
    }

    await pool.query(
      'INSERT INTO encuesta_restaurante (id_usuario, id_restaurante, fecha_registro) VALUES ($1, $2, CURRENT_DATE)',
      [userId, restaurantId]
    );

    res.json({ success: true, message: 'Encuesta registrada exitosamente' });
  } catch (error: any) {
    if (error.code === '23505') { // Código de PostgreSQL para duplicados
       return res.status(400).json({ success: false, error: 'Ya has respondido esta encuesta.' });
    }
    res.status(500).json({ success: false, error: 'Error guardando encuesta' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
