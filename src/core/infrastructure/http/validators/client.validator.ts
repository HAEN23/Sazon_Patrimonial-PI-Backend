import { z } from 'zod';

/**
 * Validador para registro de cliente
 */
export const clientRegisterSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
    .optional()
    .transform(val => val?.replace(/\s/g, '')),
});

/**
 * Validador para login de cliente
 */
export const clientLoginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

/**
 * Validador para actualizar cliente
 */
export const updateClientSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});