import { z } from 'zod';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';

/**
 * Validador para crear menú
 */
export const createMenuSchema = z.object({
  fileUrl: z.string().url('URL de archivo inválida'),
  menuUrl: z.string().url('URL de menú inválida'),
  status: z.nativeEnum(MenuStatus).default(MenuStatus.PENDING),
  restaurantId: z.number().int().positive(),
});

/**
 * Validador para actualizar menú
 */
export const updateMenuSchema = z.object({
  status: z.nativeEnum(MenuStatus).optional(),
  fileUrl: z.string().url().optional(),
  menuUrl: z.string().url().optional(),
});

/**
 * Validador para descargar menú
 */
export const downloadMenuSchema = z.object({
  restaurantId: z.number().int().positive(),
});