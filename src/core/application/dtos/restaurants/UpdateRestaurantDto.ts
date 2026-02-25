import { z } from 'zod';

/**
 * DTO para actualizar restaurante
 */
export const UpdateRestaurantDtoSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  schedule: z.string().min(1).trim().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  tags: z.array(z.string()).optional(),
  address: z.string().min(5).trim().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
});

export type UpdateRestaurantDto = z.infer<typeof UpdateRestaurantDtoSchema>;

export const validateUpdateRestaurantDto = (data: unknown): UpdateRestaurantDto => {
  return UpdateRestaurantDtoSchema.parse(data);
};