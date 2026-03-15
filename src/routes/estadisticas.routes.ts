// Archivo: src/routes/estadisticas.routes.ts
import { Router } from 'express';
import { getRestaurantStats, registerMenuDownload } from '../controllers/estadisticas.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/restaurants/:id/stats
 * @desc Obtener estadísticas de un restaurante
 * @access Private
 */
router.get('/:id/stats', authenticateToken, getRestaurantStats);

/**
 * @route POST /api/restaurants/:id/menu/click
 * @desc Registrar descarga de menú
 * @access Public
 */
router.post('/:id/menu/click', registerMenuDownload);

export default router;