import { z } from 'zod';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * DTO para registro de Admin/Restaurantero
 */
export const RegisterDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
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
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  type: z.nativeEnum(UserType).refine(
    (val) => [UserType.ADMIN, UserType.RESTAURANT_OWNER].includes(val),
    {
      message: 'Tipo de usuario inválido',
    }
  ),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const validateRegisterDto = (data: unknown): RegisterDto => {
  return RegisterDtoSchema.parse(data);
};