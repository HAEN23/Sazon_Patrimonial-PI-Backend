// Archivo: src/controllers/restaurantes.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { uploadToCloudinary } from '../utils/cloudinary.utils';

/**
 * Obtener el restaurante del usuario autenticado (Restaurantero)
 * GET /api/mi-restaurante
 */
export const getMyRestaurant = async (req: Request, res: Response) => {
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
};

/**
 * Guardar borrador (Auto-guardado sin validación)
 * PUT /api/mi-restaurante/draft
 */
export const saveDraft = async (req: Request, res: Response) => {
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
};

/**
 * Enviar a revisión (Solo cuando el usuario hace clic en "Aplicar Cambios")
 * PUT /api/mi-restaurante/submit
 */
export const submitForReview = async (req: Request, res: Response) => {
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
};

/**
 * Guardar/Actualizar restaurante (Restaurantero) - CON SUBIDA DE ARCHIVOS
 * PUT /api/mi-restaurante
 */
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

    // --- SUBIDA A CLOUDINARY ---
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
};

/**
 * Obtener todos los restaurantes públicos (Vista principal)
 * GET /api/restaurantes
 */
export const getPublicRestaurants = async (req: Request, res: Response) => {
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
};

/**
 * Obtener un restaurante específico por ID
 * GET /api/restaurantes/:id
 */
export const getRestaurantById = async (req: Request, res: Response) => {
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
};

/**
 * Obtener restaurantes activos (Admin)
 * GET /api/admin/restaurantes
 */
export const getActiveRestaurants = async (req: Request, res: Response) => {
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
};

/**
 * Eliminar restaurante (Admin)
 * DELETE /api/admin/restaurantes/:id
 */
export const deleteRestaurant = async (req: Request, res: Response) => {
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
};