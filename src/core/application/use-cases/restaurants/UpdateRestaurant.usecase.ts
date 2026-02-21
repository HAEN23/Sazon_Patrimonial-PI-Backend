import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UpdateRestaurantDto {
  restaurantId: number;
  requesterId: number;
  requesterType: UserType;
  name?: string;
  schedule?: string;
  phone?: string;
  tags?: string[];
  address?: string;
  facebook?: string;
  instagram?: string;
}

/**
 * Caso de uso: Actualizar un restaurante
 */
export class UpdateRestaurantUseCase {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(dto: UpdateRestaurantDto): Promise<void> {
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

    // Actualizar campos
    restaurant.updateInfo({
      name: dto.name,
      schedule: dto.schedule,
      phone: dto.phone,
      tags: dto.tags,
      address: dto.address,
      facebook: dto.facebook,
      instagram: dto.instagram,
    });

    await this.restaurantRepository.update(restaurant);
  }
}