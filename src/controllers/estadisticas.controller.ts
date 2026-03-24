// Archivo: src/controllers/estadisticas.controller.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';

export const getRestaurantStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const likesQuery = await pool.query('SELECT COUNT(*) as total_likes FROM favoritos WHERE id_restaurante = $1', [id]);
    const totalLikes = parseInt(likesQuery.rows[0].total_likes, 10) || 0;

    const descargasQuery = await pool.query('SELECT SUM(contador_descargas) as total_descargas FROM menu WHERE id_restaurante = $1', [id]);
    const totalDescargas = parseInt(descargasQuery.rows[0].total_descargas, 10) || 0;

    // CONSULTA ÚNICA PARA TODA LA ENCUESTA
    const encuestasQuery = await pool.query(`
      SELECT atraccion, origen, platillos, mejora 
      FROM encuesta_restaurante 
      WHERE id_restaurante = $1 
    `, [id]);

    let totalEncuestasGeneral = encuestasQuery.rows.length;
    
    // Contadores
    const cAtrac = { comida: 0, ubicacion: 0, recomendacion: 0, horario: 0, vista: 0, limpieza: 0 }; 
    const cOrigen = { nacional: 0, extranjero: 0 };
    const cPlat = { tostadas: 0, garnachas: 0, empanadas: 0, gorditas: 0, pozol: 0 };
    const cMejora = { limpieza: 0, tiempo: 0, comida: 0, etiquetas: 0, atencion: 0 };

    encuestasQuery.rows.forEach(row => {
       // Atracción
       if(row.atraccion === 'comida') cAtrac.comida++; 
       if(row.atraccion === 'ubicacion') cAtrac.ubicacion++; 
       if(row.atraccion === 'recomendacion') cAtrac.recomendacion++; 
       if(row.atraccion === 'horario') cAtrac.horario++; 
       if(row.atraccion === 'vista') cAtrac.vista++; 
       if(row.atraccion === 'limpieza') cAtrac.limpieza++; 

       // Origen
       if(row.origen === 'nacional') cOrigen.nacional++;
       if(row.origen === 'extranjero') cOrigen.extranjero++;

       // Platillos (Vienen separados por coma, ej: "Tostadas,Pozol")
       if(row.platillos) {
          const seleccionados = row.platillos.split(',');
          if(seleccionados.includes('Tostadas')) cPlat.tostadas++;
          if(seleccionados.includes('Garnachas')) cPlat.garnachas++;
          if(seleccionados.includes('Empanadas')) cPlat.empanadas++;
          if(seleccionados.includes('Gorditas')) cPlat.gorditas++;
          if(seleccionados.includes('Pozol')) cPlat.pozol++;
       }

       // Mejoras
       if(row.mejora === 'limpieza') cMejora.limpieza++;
       if(row.mejora === 'tiempo') cMejora.tiempo++;
       if(row.mejora === 'comida') cMejora.comida++;
       if(row.mejora === 'etiquetas') cMejora.etiquetas++;
       if(row.mejora === 'atencion') cMejora.atencion++;
    });

    const votosAspectos = [cAtrac.comida, cAtrac.ubicacion, cAtrac.recomendacion, cAtrac.horario, cAtrac.vista, cAtrac.limpieza];
    const votosOrigen = [cOrigen.nacional, cOrigen.extranjero];
    const votosPlatillos = [cPlat.tostadas, cPlat.garnachas, cPlat.empanadas, cPlat.gorditas, cPlat.pozol];
    const votosMejoras = [cMejora.limpieza, cMejora.tiempo, cMejora.comida, cMejora.etiquetas, cMejora.atencion];

    // Cálculos de porcentajes (igual que tu código original)
    const statsAspectos = [0, 0, 0, 0, 0, 0];
    if (totalEncuestasGeneral > 0) {
      statsAspectos[0] = Math.round((cAtrac.comida / totalEncuestasGeneral) * 100);
      statsAspectos[1] = Math.round((cAtrac.ubicacion / totalEncuestasGeneral) * 100);
      statsAspectos[2] = Math.round((cAtrac.recomendacion / totalEncuestasGeneral) * 100);
      statsAspectos[3] = Math.round((cAtrac.horario / totalEncuestasGeneral) * 100);
      statsAspectos[4] = Math.round((cAtrac.vista / totalEncuestasGeneral) * 100);
      statsAspectos[5] = Math.round((cAtrac.limpieza / totalEncuestasGeneral) * 100);
      const suma = statsAspectos.reduce((a, b) => a + b, 0);
      if (suma !== 100 && suma > 0) {
          const maxIndex = statsAspectos.indexOf(Math.max(...statsAspectos));
          statsAspectos[maxIndex] += (100 - suma);
      }
    }

    const totalOrigen = cOrigen.nacional + cOrigen.extranjero;
    const statsOrigen = [0, 0];
    if (totalOrigen > 0) {
       statsOrigen[0] = Math.round((cOrigen.nacional / totalOrigen) * 100);
       statsOrigen[1] = Math.round((cOrigen.extranjero / totalOrigen) * 100);
    }

    res.json({
      success: true,
      data: {
        likes: totalLikes, 
        descargasMenu: totalDescargas, 
        respuestasEncuesta: totalEncuestasGeneral,
        statsAspectos, votosAspectos,
        statsOrigen, votosOrigen,
        votosPlatillos, votosMejoras // NUEVOS
      }
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

export const registerMenuDownload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuCheck = await pool.query('SELECT id_menu FROM menu WHERE id_restaurante = $1', [id]);

    if (menuCheck.rows.length > 0) {
      await pool.query('UPDATE menu SET contador_descargas = contador_descargas + 1 WHERE id_restaurante = $1', [id]);
    } else {
      const restResult = await pool.query('SELECT id_usuario FROM restaurante WHERE id_restaurante = $1', [id]);
      if (restResult.rows.length > 0) {
         const idUsuario = restResult.rows[0].id_usuario;
         await pool.query('INSERT INTO menu (id_restaurante, id_usuario, contador_descargas, ruta_archivo) VALUES ($1, $2, 1, $3)', [id, idUsuario, 'Menú incrustado']);
      }
    }
    res.json({ success: true, message: 'Descarga registrada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al registrar descarga' });
  }
};