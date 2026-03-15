// Archivo: src/controllers/fotos.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { uploadToCloudinary } from '../utils/cloudinary.utils';

/**
 * Subir foto de un restaurante
 * POST /api/photos
 * Requiere: Token de autenticación y haber dado Like al restaurante
 */
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.body.restaurantId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No se detectó ninguna imagen' });
    }
    
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Falta el ID del restaurante' });
    }

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
       return res.status(403).json({ 
         success: false, 
         error: 'Debes darle a Favoritos (Like) antes de subir una foto.' 
       });
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
};

/**
 * Obtener todas las fotos de un restaurante
 * GET /api/photos/restaurant/:id
 */
export const getRestaurantPhotos = async (req: Request, res: Response) => {
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
};

/**
 * Verificar si el usuario puede subir fotos (validación previa)
 * GET /api/restaurants/:id/photos/check
 */
export const checkCanUpload = async (req: Request, res: Response) => {
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
};