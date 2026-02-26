import { z } from 'zod';

/**
 * Validador para crear restaurante
 */
export const createRestaurantSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  schedule: z.string().min(1, 'El horario es requerido'),
  phone: z.string().regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos'),
  tags: z.array(z.string()).default([]),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  facebook: z.string().url('URL de Facebook inválida').optional(),
  instagram: z.string().url('URL de Instagram inválida').optional(),
  ownerId: z.number().int().positive(),
  applicationId: z.number().int().positive(),
});

/**
 * Validador para actualizar restaurante
 */
export const updateRestaurantSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  schedule: z.string().min(1).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  tags: z.array(z.string()).optional(),
  address: z.string().min(5).optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
});

/**
 * Validador para query params de búsqueda
 */
export const searchRestaurantsSchema = z.object({
  tags: z.string().optional().transform(val => val?.split(',')),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  offset: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});