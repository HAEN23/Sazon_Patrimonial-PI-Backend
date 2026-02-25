import { z } from 'zod';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * DTO para crear usuario
 */
export const CreateUserDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100)
    .trim(),
  email: z
    .string()
    .nonempty('El email es requerido')
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .nonempty('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100),
  type: z.nativeEnum(UserType, {
    error: () => ({ message: 'Tipo de usuario inválido' }),
  }),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const validateCreateUserDto = (data: unknown): CreateUserDto => {
  return CreateUserDtoSchema.parse(data);
};