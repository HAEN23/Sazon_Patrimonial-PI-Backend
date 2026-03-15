// Archivo: src/controllers/favoritos.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * Alternar favorito (Agregar o Quitar)
 * POST /api/favorites/toggle
 */
export const toggleFavorite = async (req: Request, res: Response) => {
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
      await pool.query(
        'DELETE FROM favoritos WHERE id_usuario = $1 AND id_restaurante = $2', 
        [userId, id_restaurante]
      );
      res.json({ success: true, message: 'Removido de favoritos', isFavorite: false });
    } else {
      // Si no es favorito, lo agregamos
      await pool.query(
        'INSERT INTO favoritos (id_usuario, id_restaurante, fecha_favorito) VALUES ($1, $2, CURRENT_DATE)', 
        [userId, id_restaurante]
      );
      res.json({ success: true, message: 'Agregado a favoritos', isFavorite: true });
    }
  } catch (error) {
    console.error('Error en favoritos:', error); 
    res.status(500).json({ success: false, error: 'Error procesando favorito' });
  }
};

/**
 * Comprobar si un restaurante ya es favorito (Para la persistencia)
 * GET /api/favorites/check
 */
export const checkFavorite = async (req: Request, res: Response) => {
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
};

/**
 * Obtener todos los favoritos de un usuario
 * GET /api/clients/:id/favorites
 */
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    // Tomamos el ID de la URL y aseguramos que sea un número entero
    const idUsuario = parseInt(req.params.id, 10);
    
    const favoritosResult = await pool.query(
      `SELECT id_restaurante 
       FROM favoritos 
       WHERE id_usuario = $1`, 
      [idUsuario]
    );

    res.json({ 
      success: true, 
      data: favoritosResult.rows // Esto devuelve [{ id_restaurante: 1 }, { id_restaurante: 3 }]
    });
  } catch (error) {
    console.error('Error obteniendo lista de favoritos:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo favoritos' });
  }
};