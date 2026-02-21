import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';

export interface GetMenusByRestaurantResult {
  menus: Array<{
    id: number;
    fileUrl: string;
    menuUrl: string;
    status: string;
    downloadCount: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener menús de un restaurante
 */
export class GetMenusByRestaurantUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(restaurantId: number): Promise<GetMenusByRestaurantResult> {
    const menus = await this.menuRepository.findByRestaurantId(restaurantId);

    const menusData = menus.map(menu => ({
      id: menu.id,
      fileUrl: menu.fileUrl.getValue(),
      menuUrl: menu.menuUrl.getValue(),
      status: menu.status,
      downloadCount: menu.downloadCount,
      createdAt: menu.createdAt,
    }));

    return {
      menus: menusData,
      total: menus.length,
    };
  }
}