import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteMenuDto {
  menuId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar un menú
 */
export class DeleteMenuUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: DeleteMenuDto): Promise<void> {
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

    // Eliminar archivos
    try {
      await this.fileStorage.delete(menu.fileUrl.getValue());
      await this.fileStorage.delete(menu.menuUrl.getValue());
    } catch (error) {
      console.error('Error al eliminar archivos:', error);
    }

    // Eliminar registro
    await this.menuRepository.delete(dto.menuId);
  }
}