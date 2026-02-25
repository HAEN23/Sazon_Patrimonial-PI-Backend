import { z } from 'zod';

/**
 * DTO para registro de Cliente
 */
export const ClientRegisterDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
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
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
    .optional()
    .transform(val => val?.replace(/\s/g, '')),
});

export type ClientRegisterDto = z.infer<typeof ClientRegisterDtoSchema>;

export const validateClientRegisterDto = (data: unknown): ClientRegisterDto => {
  return ClientRegisterDtoSchema.parse(data);
};