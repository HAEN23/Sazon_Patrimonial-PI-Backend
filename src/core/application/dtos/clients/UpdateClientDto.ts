import { z } from 'zod';

/**
 * DTO para actualizar cliente
 */
export const UpdateClientDtoSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>;

export const validateUpdateClientDto = (data: unknown): UpdateClientDto => {
  return UpdateClientDtoSchema.parse(data);
};