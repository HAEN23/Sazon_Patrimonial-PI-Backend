// Archivo: src/routes/fotos.routes.ts
import { Router } from 'express';
import { uploadPhoto, getRestaurantPhotos } from '../controllers/fotos.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @route POST /api/photos
 * @desc Subir foto de un restaurante
 * @access Private (requiere token y like previo)
 */
router.post('/', authenticateToken, uploadSingle, uploadPhoto);

/**
 * @route GET /api/photos/restaurant/:id
 * @desc Obtener todas las fotos de un restaurante
 * @access Public
 */
router.get('/restaurant/:id', getRestaurantPhotos);

export default router;