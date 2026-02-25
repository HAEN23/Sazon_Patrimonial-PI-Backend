import { z } from 'zod';

/**
 * DTO para dar/quitar like
 */
export const ToggleFavoriteDtoSchema = z.object({
  clientId: z.number()
    
    .int({ message: 'El ID del cliente debe ser un número entero' })
    .positive({ message: 'El ID del cliente debe ser positivo' }),
  restaurantId: z.number()
    .int({ message: 'El ID del restaurante debe ser un número entero' })
    .positive({ message: 'El ID del restaurante debe ser positivo' }),
});

export type ToggleFavoriteDto = z.infer<typeof ToggleFavoriteDtoSchema>;

export const validateToggleFavoriteDto = (data: unknown): ToggleFavoriteDto => {
  return ToggleFavoriteDtoSchema.parse(data);
};