import { z } from 'zod';

/**
 * Validador para toggle favorite
 */
export const toggleFavoriteSchema = z.object({
  restaurantId: z.number().int().positive('ID de restaurante inválido'),
});

/**
 * Validador para verificar favorite
 */
export const checkFavoriteSchema = z.object({
  restaurantId: z.string().transform(val => parseInt(val)),
});