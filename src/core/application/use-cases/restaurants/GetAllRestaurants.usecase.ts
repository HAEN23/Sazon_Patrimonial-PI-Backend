import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { Restaurant } from '@/core/domain/entities/Restaurant.entity';

export interface GetAllRestaurantsFilters {
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface GetAllRestaurantsResult {
  restaurants: Array<{
    id: number;
    name: string;
    schedule: string;
    phone: string;
    tags: string[];
    address: string;
    facebook?: string;
    instagram?: string;
    likesCount: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los restaurantes
 */
export class GetAllRestaurantsUseCase {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(filters?: GetAllRestaurantsFilters): Promise<GetAllRestaurantsResult> {
    let restaurants: Restaurant[];

    // Filtrar por tags si se proporcionan
    if (filters?.tags && filters.tags.length > 0) {
      restaurants = await this.restaurantRepository.findByTags(filters.tags);
    } else {
      restaurants = await this.restaurantRepository.findAll();
    }

    // Aplicar paginación
    if (filters?.offset !== undefined || filters?.limit !== undefined) {
      const offset = filters.offset || 0;
      const limit = filters.limit || restaurants.length;
      restaurants = restaurants.slice(offset, offset + limit);
    }

    // Mapear resultados
    const restaurantsData = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      schedule: r.schedule,
      phone: r.phone.getValue(),
      tags: r.tags,
      address: r.address,
      facebook: r.facebook?.getValue(),
      instagram: r.instagram?.getValue(),
      likesCount: r.likesCount,
      createdAt: r.createdAt,
    }));

    const total = await this.restaurantRepository.count();

    return {
      restaurants: restaurantsData,
      total,
    };
  }
}