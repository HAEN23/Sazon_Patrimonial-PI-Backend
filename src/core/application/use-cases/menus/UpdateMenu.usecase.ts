import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UpdateMenuDto {
  menuId: number;
  requesterId: number;
  requesterType: UserType;
  status?: MenuStatus;
  fileUrl?: string;
  menuUrl?: string;
}

/**
 * Caso de uso: Actualizar un menú
 */
export class UpdateMenuUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(dto: UpdateMenuDto): Promise<void> {
    const menu = await this.menuRepository.findById(dto.menuId);
    if (!menu) {
      throw NotFoundException.menuNotFound(dto.menuId);
    }

    const restaurant = await this.restaurantRepository.findById(menu.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(menu.restaurantId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('menú');
    }

    // Actualizar estado
    if (dto.status) {
      switch (dto.status) {
        case MenuStatus.ACTIVE:
          menu.activate();
          break;
        case MenuStatus.INACTIVE:
          menu.deactivate();
          break;
        case MenuStatus.PENDING:
          menu.setToPending();
          break;
        case MenuStatus.REVISION:
          menu.setToRevision();
          break;
      }
    }

    await this.menuRepository.update(menu);
  }
}