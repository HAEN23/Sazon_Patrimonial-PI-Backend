import { z } from 'zod';

/**
 * DTO para crear zona
 */
export const CreateZoneDtoSchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100)
    .trim(),
  ownerId: z.number()
    .int({ message: 'El ID del propietario es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del propietario debe ser positivo' }),
});

export type CreateZoneDto = z.infer<typeof CreateZoneDtoSchema>;

export const validateCreateZoneDto = (data: unknown): CreateZoneDto => {
  return CreateZoneDtoSchema.parse(data);
};