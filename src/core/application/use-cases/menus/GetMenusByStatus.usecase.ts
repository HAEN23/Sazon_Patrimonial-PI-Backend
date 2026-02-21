import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';

export interface GetMenusByStatusResult {
  menus: Array<{
    id: number;
    restaurantId: number;
    fileUrl: string;
    status: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener menús por estado
 */
export class GetMenusByStatusUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(status: MenuStatus): Promise<GetMenusByStatusResult> {
    const menus = await this.menuRepository.findByStatus(status);

    const menusData = menus.map(menu => ({
      id: menu.id,
      restaurantId: menu.restaurantId,
      fileUrl: menu.fileUrl.getValue(),
      status: menu.status,
      createdAt: menu.createdAt,
    }));

    return {
      menus: menusData,
      total: menus.length,
    };
  }
}