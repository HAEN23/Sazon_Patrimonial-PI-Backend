// Archivo: src/controllers/estadisticas.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * Obtener estadísticas completas de un restaurante
 * GET /api/restaurants/:id/stats
 */
export const getRestaurantStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. LIKES Y DESCARGAS
    const likesQuery = await pool.query(
      'SELECT COUNT(*) as total_likes FROM favoritos WHERE id_restaurante = $1', 
      [id]
    );
    const totalLikes = parseInt(likesQuery.rows[0].total_likes, 10) || 0;

    const descargasQuery = await pool.query(
      'SELECT SUM(contador_descargas) as total_descargas FROM menu WHERE id_restaurante = $1', 
      [id]
    );
    const totalDescargas = parseInt(descargasQuery.rows[0].total_descargas, 10) || 0;

    // 2. ENCUESTAS - ASPECTOS DESTACADOS
    const aspectosQuery = await pool.query(`
      SELECT atraccion, COUNT(*) as cantidad 
      FROM encuesta_restaurante 
      WHERE id_restaurante = $1 
      GROUP BY atraccion
    `, [id]);

    let totalEncuestasGeneral = 0;
    const conteo = { comida: 0, ubicacion: 0, recomendacion: 0, horario: 0, vista: 0 }; 

    aspectosQuery.rows.forEach(row => {
       const cantidad = parseInt(row.cantidad, 10);
       totalEncuestasGeneral += cantidad;
       
       if(row.atraccion === 'comida') conteo.comida += cantidad; 
       if(row.atraccion === 'ubicacion') conteo.ubicacion += cantidad; 
       if(row.atraccion === 'recomendacion') conteo.recomendacion += cantidad; 
       if(row.atraccion === 'horario') conteo.horario += cantidad; 
       if(row.atraccion === 'vista') conteo.vista += cantidad; 
    });

    const votosAspectos = [conteo.comida, conteo.ubicacion, conteo.recomendacion, conteo.horario, conteo.vista];
    const statsAspectos = [0, 0, 0, 0, 0];

    if (totalEncuestasGeneral > 0) {
      statsAspectos[0] = Math.round((conteo.comida / totalEncuestasGeneral) * 100);
      statsAspectos[1] = Math.round((conteo.ubicacion / totalEncuestasGeneral) * 100);
      statsAspectos[2] = Math.round((conteo.recomendacion / totalEncuestasGeneral) * 100);
      statsAspectos[3] = Math.round((conteo.horario / totalEncuestasGeneral) * 100);
      statsAspectos[4] = Math.round((conteo.vista / totalEncuestasGeneral) * 100);
      
      // Ajustar para que sume exactamente 100%
      const suma = statsAspectos.reduce((a, b) => a + b, 0);
      if (suma !== 100 && suma > 0) {
          const maxIndex = statsAspectos.indexOf(Math.max(...statsAspectos));
          statsAspectos[maxIndex] += (100 - suma);
      }
    }

    // 3. ENCUESTAS - ORIGEN
    const origenQuery = await pool.query(`
      SELECT origen, COUNT(*) as cantidad 
      FROM encuesta_restaurante 
      WHERE id_restaurante = $1 
      GROUP BY origen
    `, [id]);

    const conteoOrigen = { nacional: 0, extranjero: 0 };
    origenQuery.rows.forEach(row => {
      if(row.origen === 'nacional') conteoOrigen.nacional = parseInt(row.cantidad, 10);
      if(row.origen === 'extranjero') conteoOrigen.extranjero = parseInt(row.cantidad, 10);
    });

    const votosOrigen = [conteoOrigen.nacional, conteoOrigen.extranjero];
    const totalOrigen = conteoOrigen.nacional + conteoOrigen.extranjero;
    const statsOrigen = [0, 0];

    if (totalOrigen > 0) {
       statsOrigen[0] = Math.round((conteoOrigen.nacional / totalOrigen) * 100);
       statsOrigen[1] = Math.round((conteoOrigen.extranjero / totalOrigen) * 100);
    }

    // 4. RESPUESTA FINAL AL FRONTEND
    res.json({
      success: true,
      data: {
        likes: totalLikes, 
        descargasMenu: totalDescargas, 
        respuestasEncuesta: totalEncuestasGeneral,
        statsAspectos: statsAspectos,
        votosAspectos: votosAspectos,
        statsOrigen: statsOrigen,
        votosOrigen: votosOrigen,
        statsRecomendacion: [0, 0, 0, 0, 0] 
      }
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

/**
 * Registrar un clic/descarga del menú
 * POST /api/restaurants/:id/menu/click
 */
export const registerMenuDownload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificamos si ya existe un registro de menú para este restaurante
    const menuCheck = await pool.query('SELECT id_menu FROM menu WHERE id_restaurante = $1', [id]);

    if (menuCheck.rows.length > 0) {
      // Si existe, le sumamos 1 a la columna contador_descargas
      await pool.query(
        'UPDATE menu SET contador_descargas = contador_descargas + 1 WHERE id_restaurante = $1', 
        [id]
      );
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
};