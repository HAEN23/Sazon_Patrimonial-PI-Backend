import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetRestaurantsByOwnerResult {
  restaurants: Array<{
    id: number;
    name: string;
    schedule: string;
    phone: string;
    address: string;
    likesCount: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener restaurantes de un propietario
 */
export class GetRestaurantsByOwnerUseCase {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(ownerId: number): Promise<GetRestaurantsByOwnerResult> {
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);

    const restaurantsData = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      schedule: r.schedule,
      phone: r.phone.getValue(),
      address: r.address,
      likesCount: r.likesCount,
      createdAt: r.createdAt,
    }));

    return {
      restaurants: restaurantsData,
      total: restaurants.length,
    };
  }
}