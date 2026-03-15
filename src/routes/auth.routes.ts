// Archivo: src/routes/auth.routes.ts
import { Router } from 'express';
import { login, registerGeneral, registerClient } from '../controllers/auth.controller';

const router = Router();

/**
 * @route POST /api/login
 * @desc Iniciar sesión de usuario
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario (general)
 * @access Public
 */
router.post('/auth/register', registerGeneral);

/**
 * @route POST /api/client/register
 * @desc Registrar nuevo cliente (frontend)
 * @access Public
 */
router.post('/client/register', registerClient);

export default router;