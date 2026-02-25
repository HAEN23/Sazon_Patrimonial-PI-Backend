import { z } from 'zod';

/**
 * DTO para crear cliente
 */
export const CreateClientDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100)
    .trim(),
  email: z
    .string()
    .nonempty('El correo es requerido')
    .email('Correo inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .nonempty('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
    .optional(),
});

export type CreateClientDto = z.infer<typeof CreateClientDtoSchema>;

export const validateCreateClientDto = (data: unknown): CreateClientDto => {
  return CreateClientDtoSchema.parse(data);
};