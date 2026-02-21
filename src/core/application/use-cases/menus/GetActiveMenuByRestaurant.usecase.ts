import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetActiveMenuResult {
  id: number;
  fileUrl: string;
  menuUrl: string;
  downloadCount: number;
  createdAt: Date;
}

/**
 * Caso de uso: Obtener menú activo de un restaurante
 */
export class GetActiveMenuByRestaurantUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(restaurantId: number): Promise<GetActiveMenuResult> {
    const menu = await this.menuRepository.findActiveByRestaurant(restaurantId);

    if (!menu) {
      throw new NotFoundException(
        'No hay menú activo para este restaurante',
        'Menu',
        restaurantId
      );
    }

    return {
      id: menu.id,
      fileUrl: menu.fileUrl.getValue(),
      menuUrl: menu.menuUrl.getValue(),
      downloadCount: menu.downloadCount,
      createdAt: menu.createdAt,
    };
  }
}