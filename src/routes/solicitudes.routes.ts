// Archivo: src/routes/solicitudes.routes.ts
import { Router } from 'express';
import { getPendingApplications, approveApplication, rejectApplication } from '../controllers/solicitudes.controller';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/solicitudes/estado/Pendiente
 * @desc Obtener solicitudes pendientes
 * @access Private (Admin)
 */
router.get('/estado/Pendiente', authenticateToken, isAdmin, getPendingApplications);

/**
 * @route PATCH /api/solicitudes/:id/aprobar
 * @desc Aprobar una solicitud
 * @access Private (Admin)
 */
router.patch('/:id/aprobar', authenticateToken, isAdmin, approveApplication);

/**
 * @route PATCH /api/solicitudes/:id/rechazar
 * @desc Rechazar una solicitud
 * @access Private (Admin)
 */
router.patch('/:id/rechazar', authenticateToken, isAdmin, rejectApplication);

export default router;