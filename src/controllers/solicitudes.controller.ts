// Archivo: src/controllers/solicitudes.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * Obtener solicitudes pendientes (Admin)
 * GET /api/solicitudes/estado/Pendiente
 */
export const getPendingApplications = async (req: Request, res: Response) => {
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
};

/**
 * Aprobar solicitud (Admin)
 * PATCH /api/solicitudes/:id/aprobar
 */
export const approveApplication = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const adminId = (req as any).user.id; // Extraemos el ID del Admin que hizo la acción

    // 1. Obtener solicitud
    const solRes = await client.query('SELECT * FROM solicitud_registro WHERE id_solicitud = $1', [id]);
    if (solRes.rows.length === 0) {
      throw new Error('Solicitud no encontrada');
    }
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

    // 4. Insertar el registro en la tabla de revision_solicitud
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
};

/**
 * Rechazar solicitud (Admin)
 * PATCH /api/solicitudes/:id/rechazar
 */
export const rejectApplication = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const adminId = (req as any).user.id; // Extraemos el ID del Admin

    // 1. Cambiar estado de la solicitud a "Rechazado"
    await client.query("UPDATE solicitud_registro SET estado = 'Rechazado' WHERE id_solicitud = $1", [id]);

    // 2. Insertar el registro en la tabla de revision_solicitud
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
};