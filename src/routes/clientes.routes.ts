// Archivo: src/routes/clientes.routes.ts
import { Router } from 'express';
import { getUserFavorites } from '../controllers/favoritos.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/clients/:id/favorites
 * @desc Obtener favoritos de un usuario
 * @access Private
 */
router.get('/:id/favorites', authenticateToken, getUserFavorites);

export default router;