import { z } from 'zod';

/**
 * DTO para login de Admin/Restaurantero
 */
export const LoginDtoSchema = z.object({
  email: z
    .string()
    .nonempty('El email es requerido')
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .min(1, 'La contraseña es requerida'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

// Helper para validar
export const validateLoginDto = (data: unknown): LoginDto => {
  return LoginDtoSchema.parse(data);
};