import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetMenusByOwnerResult {
  menus: Array<{
    id: number;
    restaurantId: number;
    restaurantName: string;
    fileUrl: string;
    status: string;
    downloadCount: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los menús de un propietario
 */
export class GetMenusByOwnerUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(ownerId: number): Promise<GetMenusByOwnerResult> {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);
    const restaurantIds = restaurants.map(r => r.id);

    const allMenus = await Promise.all(
      restaurantIds.map(id => this.menuRepository.findByRestaurantId(id))
    );

    const menus = allMenus.flat();

    const menusData = await Promise.all(
      menus.map(async (menu) => {
        const restaurant = await this.restaurantRepository.findById(menu.restaurantId);
        
        return {
          id: menu.id,
          restaurantId: menu.restaurantId,
          restaurantName: restaurant?.name || 'Desconocido',
          fileUrl: menu.fileUrl.getValue(),
          status: menu.status,
          downloadCount: menu.downloadCount,
          createdAt: menu.createdAt,
        };
      })
    );

    return {
      menus: menusData,
      total: menusData.length,
    };
  }
}