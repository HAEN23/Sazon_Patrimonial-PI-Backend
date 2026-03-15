// Archivo: src/routes/encuestas.routes.ts
import { Router } from 'express';
import { checkSurveyStatus, submitSurvey } from '../controllers/encuestas.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route GET /api/restaurants/:id/survey/check
 * @desc Verificar si el usuario ya respondió la encuesta
 * @access Private (requiere token)
 */
router.get('/:id/survey/check', authenticateToken, checkSurveyStatus);

/**
 * @route POST /api/restaurants/:id/survey
 * @desc Guardar la respuesta de la encuesta
 * @access Private (requiere token)
 */
router.post('/:id/survey', authenticateToken, submitSurvey);

export default router;