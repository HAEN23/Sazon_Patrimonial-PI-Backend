import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteRestaurantDto {
  restaurantId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar un restaurante
 */
export class DeleteRestaurantUseCase {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(dto: DeleteRestaurantDto): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(dto.restaurantId);
    }

    // Solo admin o el propietario pueden eliminar
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('restaurante');
    }

    const deleted = await this.restaurantRepository.delete(dto.restaurantId);
    if (!deleted) {
      throw new Error('No se pudo eliminar el restaurante');
    }
  }
}