import { z } from 'zod';

/**
 * DTO para crear restaurante
 */
export const CreateRestaurantDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100)
    .trim(),
  schedule: z
    .string()
    .nonempty('El horario es requerido')
    .min(1, 'El horario es requerido')
    .trim(),
  phone: z
    .string()
    .nonempty('El teléfono es requerido')
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos'),
  tags: z.array(z.string()).default([]),
  address: z
    .string()
    .nonempty('La dirección es requerida')
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .trim(),
  facebook: z.string().url('URL de Facebook inválida').optional(),
  instagram: z.string().url('URL de Instagram inválida').optional(),
  ownerId: z.number()
    .int({ message: 'El ID del propietario debe ser un número entero' })
    .positive({ message: 'El ID del propietario debe ser positivo' }),
  applicationId: z.number()
    .int({ message: 'El ID de solicitud debe ser un número entero' })
    .positive({ message: 'El ID de solicitud debe ser positivo' }),
});

export type CreateRestaurantDto = z.infer<typeof CreateRestaurantDtoSchema>;

export const validateCreateRestaurantDto = (data: unknown): CreateRestaurantDto => {
  return CreateRestaurantDtoSchema.parse(data);
};