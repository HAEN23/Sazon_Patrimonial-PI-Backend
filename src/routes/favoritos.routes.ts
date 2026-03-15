// Archivo: src/routes/favoritos.routes.ts
import { Router } from 'express';
import { toggleFavorite, checkFavorite } from '../controllers/favoritos.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/favorites/toggle
 * @desc Agregar o quitar de favoritos
 * @access Private (requiere token)
 */
router.post('/toggle', authenticateToken, toggleFavorite);

/**
 * @route GET /api/favorites/check
 * @desc Verificar si un restaurante está en favoritos
 * @access Private (requiere token)
 */
router.get('/check', authenticateToken, checkFavorite);

export default router;