import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetRestaurantsByZoneResult {
  zone: {
    id: number;
    name: string;
  };
  restaurants: Array<{
    id: number;
    name: string;
    address: string;
    likesCount: number;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener restaurantes por zona
 */
export class GetRestaurantsByZoneUseCase {
  constructor(
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly zoneRepository: IZoneRepository
  ) {}

  async execute(zoneId: number): Promise<GetRestaurantsByZoneResult> {
    // Verificar que la zona existe
    const zone = await this.zoneRepository.findById(zoneId);
    if (!zone) {
      throw NotFoundException.zoneNotFound(zoneId);
    }

    const restaurants = await this.restaurantRepository.findByZoneId(zoneId);

    const restaurantsData = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      likesCount: r.likesCount,
    }));

    return {
      zone: {
        id: zone.id,
        name: zone.name,
      },
      restaurants: restaurantsData,
      total: restaurants.length,
    };
  }
}