// Archivo: src/controllers/encuestas.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * Verificar si el usuario ya respondió la encuesta de un restaurante
 * GET /api/restaurants/:id/survey/check
 */
export const checkSurveyStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.params.id;

    // Buscamos al usuario en la tabla general
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    
    if (usuarioQuery.rows.length === 0) {
       return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    const usuario = usuarioQuery.rows[0];
    const rolNumero = parseInt(usuario.id_rol, 10);

    // Bloqueamos SÓLO a los Restauranteros (Rol 2)
    if (rolNumero === 2) {
      return res.status(403).json({ 
        success: false, 
        message: "Como Restaurantero, no puedes responder encuestas de satisfacción." 
      });
    }

    // Dejamos pasar al resto (Clientes y Admins) y checamos si ya contestaron
    const checkResult = await pool.query(
      'SELECT id_encuesta FROM encuesta_restaurante WHERE id_usuario = $1 AND id_restaurante = $2',
      [userId, restaurantId]
    );

    res.json({ success: true, hasAnswered: checkResult.rows.length > 0 });
  } catch (error) {
    console.error("Error verificando encuesta:", error);
    res.status(500).json({ success: false, message: 'Error interno verificando la encuesta' });
  }
};

/**
 * Guardar la respuesta de la encuesta
 * POST /api/restaurants/:id/survey
 */
export const submitSurvey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const restaurantId = req.params.id;
    const { atraccion, origen } = req.body; 

    // Buscamos al usuario
    const usuarioQuery = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    
    if (usuarioQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }
    
    const usuario = usuarioQuery.rows[0];
    const rolNumero = parseInt(usuario.id_rol, 10);

    // Bloqueamos SÓLO a los Restauranteros
    if (rolNumero === 2) {
      return res.status(403).json({ success: false, message: "Los restauranteros no pueden responder encuestas." });
    }

    if (!atraccion || !origen) {
       return res.status(400).json({ success: false, message: "Faltan datos de la encuesta." });
    }

    // Guardar la encuesta
    await pool.query(
      'INSERT INTO encuesta_restaurante (id_usuario, id_restaurante, atraccion, origen, fecha_registro) VALUES ($1, $2, $3, $4, CURRENT_DATE)',
      [userId, restaurantId, atraccion, origen]
    );

    res.json({ success: true, message: 'Encuesta registrada exitosamente' });
  } catch (error: any) {
    if (error.code === '23505') { 
       return res.status(400).json({ success: false, error: 'Ya has respondido esta encuesta.' });
    }
    console.error("Error guardando encuesta:", error);
    res.status(500).json({ success: false, error: 'Error guardando encuesta' });
  }
};