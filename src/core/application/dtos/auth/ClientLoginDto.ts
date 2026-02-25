import { z } from 'zod';

/**
 * DTO para login de Cliente
 */
export const ClientLoginDtoSchema = z.object({
  email: z
    .string()
    .nonempty('El correo es requerido')
    .email('Correo inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .min(1, 'La contraseña es requerida'),
});

export type ClientLoginDto = z.infer<typeof ClientLoginDtoSchema>;

export const validateClientLoginDto = (data: unknown): ClientLoginDto => {
  return ClientLoginDtoSchema.parse(data);
};