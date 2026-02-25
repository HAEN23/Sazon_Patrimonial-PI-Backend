import { z } from 'zod';

/**
 * DTO para registro completo de restaurante
 */
export const RegisterRestaurantDtoSchema = z.object({
  proposedRestaurantName: z
    .string()
    .nonempty('El nombre propuesto es requerido')
    .min(3)
    .max(100)
    .trim(),
  ownerName: z
    .string()
    .nonempty('El nombre del propietario es requerido')
    .min(3)
    .max(100)
    .trim(),
  email: z
    .string()
    .nonempty('El email es requerido')
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  schedule: z
    .string()
    .nonempty('El horario es requerido')
    .min(1)
    .trim(),
  phone: z
    .string()
    .nonempty('El teléfono es requerido')

    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos'),
  tags: z.array(z.string()).default([]),
  address: z
    .string()
    .nonempty('La dirección es requerida')
    .min(5)
    .trim(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  ownerId: z.number().int().positive(),
});

export type RegisterRestaurantDto = z.infer<typeof RegisterRestaurantDtoSchema>;

export const validateRegisterRestaurantDto = (data: unknown): RegisterRestaurantDto => {
  return RegisterRestaurantDtoSchema.parse(data);
};