import { z } from 'zod';

/**
 * DTO para actualizar usuario
 */
export const UpdateUserDtoSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;

export const validateUpdateUserDto = (data: unknown): UpdateUserDto => {
  return UpdateUserDtoSchema.parse(data);
};