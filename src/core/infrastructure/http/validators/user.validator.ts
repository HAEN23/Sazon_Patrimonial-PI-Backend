import { z } from 'zod';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * Validador para crear usuario
 */
export const createUserSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  // CORRECCIÓN FINAL: Usamos la propiedad "error" o "message" que exige tu versión de Zod
  type: z.nativeEnum(UserType, { 
    error: 'Tipo de usuario inválido' 
  }),
  phone: z.string().regex(/^[0-9]{10}$/, 'Teléfono debe tener 10 dígitos').optional(),
});

/**
 * Validador para actualizar usuario
 */
export const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

/**
 * Validador para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

/**
 * Validador para cambiar contraseña
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});