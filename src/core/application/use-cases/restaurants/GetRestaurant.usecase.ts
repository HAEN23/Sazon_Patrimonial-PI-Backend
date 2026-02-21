import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetRestaurantResult {
  id: number;
  name: string;
  schedule: string;
  phone: string;
  tags: string[];
  address: string;
  facebook?: string;
  instagram?: string;
  ownerId: number;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caso de uso: Obtener un restaurante por ID
 */
export class GetRestaurantUseCase {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(restaurantId: number): Promise<GetRestaurantResult> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);

    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(restaurantId);
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      schedule: restaurant.schedule,
      phone: restaurant.phone.getValue(),
      tags: restaurant.tags,
      address: restaurant.address,
      facebook: restaurant.facebook?.getValue(),
      instagram: restaurant.instagram?.getValue(),
      ownerId: restaurant.ownerId,
      likesCount: restaurant.likesCount,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }
}