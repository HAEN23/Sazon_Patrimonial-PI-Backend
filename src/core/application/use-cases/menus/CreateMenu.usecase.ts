import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { Menu } from '@/core/domain/entities/Menu.entity';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface CreateMenuDto {
  fileUrl: string;
  menuUrl: string;
  status: MenuStatus;
  restaurantId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Crear un nuevo menú
 */
export class CreateMenuUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(dto: CreateMenuDto): Promise<Menu> {
    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(dto.restaurantId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('restaurante');
    }

    // Crear menú
    const menu = Menu.create({
      fileUrl: dto.fileUrl,
      menuUrl: dto.menuUrl,
      status: dto.status,
      restaurantId: dto.restaurantId,
    });

    return await this.menuRepository.save(menu);
  }
}