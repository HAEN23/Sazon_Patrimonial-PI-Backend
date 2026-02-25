import { z } from 'zod';

/**
 * DTO para descargar menú
 */
export const DownloadMenuDtoSchema = z.object({
  clientId: z.number()
    .int({ message: 'El ID del cliente es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del cliente debe ser positivo' }),

  restaurantId: z.number()
    .int({ message: 'El ID del restaurante es necesario y debe ser un número entero' })
    .positive({ message: 'El ID del restaurante debe ser positivo' }),
});

export type DownloadMenuDto = z.infer<typeof DownloadMenuDtoSchema>;

export const validateDownloadMenuDto = (data: unknown): DownloadMenuDto => {
  return DownloadMenuDtoSchema.parse(data);
};