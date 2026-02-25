import { z } from 'zod';

/**
 * DTO para subir foto de usuario
 */
export const UploadUserPhotoDtoSchema = z.object({
  clientId: z.number()
    .int({ message: 'El ID del cliente es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del cliente debe ser positivo' }),
  restaurantId: z.number()
    .int({ message: 'El ID del restaurante es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del restaurante debe ser positivo' }),
  filename: z.string()
    .nonempty('El nombre del archivo es requerido')
});

export type UploadUserPhotoDto = z.infer<typeof UploadUserPhotoDtoSchema>;

export const validateUploadUserPhotoDto = (data: unknown): UploadUserPhotoDto => {
  return UploadUserPhotoDtoSchema.parse(data);
};