import { z } from 'zod';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';

/**
 * DTO para crear menú
 */
export const CreateMenuDtoSchema = z.object({
  fileUrl: z.string().url('URL inválida'),
  menuUrl: z.string().url('URL inválida'),
  status: z.nativeEnum(MenuStatus).default(MenuStatus.PENDING),
  restaurantId: z.number().int().positive(),
});

export type CreateMenuDto = z.infer<typeof CreateMenuDtoSchema>;

export const validateCreateMenuDto = (data: unknown): CreateMenuDto => {
  return CreateMenuDtoSchema.parse(data);
};