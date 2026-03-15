// Archivo: src/routes/restaurantes.routes.ts
import { Router } from 'express';
import {
  getMyRestaurant,
  saveDraft,
  submitForReview,
  updateRestaurant,
  getPublicRestaurants,
  getRestaurantById,
  getActiveRestaurants,
  deleteRestaurant
} from '../controllers/restaurantes.controller';
import { checkCanUpload } from '../controllers/fotos.controller'; // ⚠️ IMPORTANTE: Importar del controller de fotos
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware';
import { uploadFields } from '../middlewares/upload.middleware';

const router = Router();

// ============================================
// RUTAS DEL RESTAURANTERO
// ============================================

/**
 * @route GET /api/mi-restaurante
 * @desc Obtener mi restaurante (Restaurantero)
 * @access Private
 */
router.get('/mi-restaurante', authenticateToken, getMyRestaurant);

/**
 * @route PUT /api/mi-restaurante/draft
 * @desc Guardar borrador (auto-guardado)
 * @access Private
 */
router.put('/mi-restaurante/draft', authenticateToken, uploadFields, saveDraft);

/**
 * @route PUT /api/mi-restaurante/submit
 * @desc Enviar a revisión
 * @access Private
 */
router.put('/mi-restaurante/submit', authenticateToken, submitForReview);

/**
 * @route PUT /api/mi-restaurante
 * @desc Guardar/Actualizar restaurante completo
 * @access Private
 */
router.put('/mi-restaurante', authenticateToken, uploadFields, updateRestaurant);

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * @route GET /api/restaurantes
 * @desc Obtener todos los restaurantes públicos
 * @access Public
 */
router.get('/restaurantes', getPublicRestaurants);

/**
 * @route GET /api/restaurantes/:id
 * @desc Obtener un restaurante por ID
 * @access Public
 */
router.get('/restaurantes/:id', getRestaurantById);

/**
 * @route GET /api/restaurants/:id/photos/check
 * @desc Verificar si puede subir fotos
 * @access Private
 */
router.get('/restaurants/:id/photos/check', authenticateToken, checkCanUpload);

// ============================================
// RUTAS DEL ADMIN
// ============================================

/**
 * @route GET /api/admin/restaurantes
 * @desc Obtener restaurantes activos (Admin)
 * @access Private (Admin)
 */
router.get('/admin/restaurantes', authenticateToken, isAdmin, getActiveRestaurants);

/**
 * @route DELETE /api/admin/restaurantes/:id
 * @desc Eliminar restaurante (Admin)
 * @access Private (Admin)
 */
router.delete('/admin/restaurantes/:id', authenticateToken, isAdmin, deleteRestaurant);

export default router;