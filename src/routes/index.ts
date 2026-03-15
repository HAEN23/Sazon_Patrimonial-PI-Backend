// Archivo: src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import solicitudesRoutes from './solicitudes.routes';
import restaurantesRoutes from './restaurantes.routes';
import favoritosRoutes from './favoritos.routes';
import clientesRoutes from './clientes.routes';
import fotosRoutes from './fotos.routes';
import estadisticasRoutes from './estadisticas.routes';
import encuestasRoutes from './encuestas.routes'; // ✅ CORREGIDO

const router = Router();

// ============================================
// MONTAR TODAS LAS RUTAS
// ============================================

// Autenticación (login directo en /api/login y registro en /api/auth/...)
router.use('/', authRoutes);

// Solicitudes
router.use('/solicitudes', solicitudesRoutes);

// Restaurantes
router.use('/', restaurantesRoutes);

// Favoritos
router.use('/favorites', favoritosRoutes);

// Clientes (para favoritos por usuario)
router.use('/clients', clientesRoutes);

// Fotos
router.use('/photos', fotosRoutes);

// Estadísticas
router.use('/restaurants', estadisticasRoutes);

// Encuestas
router.use('/restaurants', encuestasRoutes);

export default router;