import { z } from 'zod';

/**
 * DTO para subir imagen
 */
export const UploadImageDtoSchema = z.object({
  filename: z.string()
    .nonempty('El nombre del archivo es requerido'),
  restaurantId: z.number()
    .int({ message: 'El ID del restaurante es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del restaurante debe ser positivo' }),
  applicationId: z.number()
    .int({ message: 'El ID de la solicitud es necesario y debe ser un número entero' })
    .positive({ message: 'El ID de la solicitud debe ser positivo' }),
  ownerId: z.number()
    .int({ message: 'El ID del propietario es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del propietario debe ser positivo' }),
});

export type UploadImageDto = z.infer<typeof UploadImageDtoSchema>;

export const validateUploadImageDto = (data: unknown): UploadImageDto => {
  return UploadImageDtoSchema.parse(data);
};