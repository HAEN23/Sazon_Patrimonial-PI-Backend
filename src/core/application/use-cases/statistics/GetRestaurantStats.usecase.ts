import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface RestaurantStatsResult {
  restaurantId: number;
  restaurantName: string;
  likes: number;
  photos: number;
  downloads: number;
}

/**
 * Caso de uso: Obtener estadísticas de un restaurante
 */
export class GetRestaurantStatsUseCase {
  constructor(
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly menuRepository: IMenuRepository
  ) {}

  async execute(restaurantId: number): Promise<RestaurantStatsResult> {
    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(restaurantId);
    }

    // Obtener estadísticas del restaurante
    const [likes, photos, downloads] = await Promise.all([
      this.favoriteRepository.countByRestaurant(restaurantId),
      this.userPhotoRepository.countByRestaurant(restaurantId),
      this.menuRepository.getTotalDownloadsByRestaurant(restaurantId),
    ]);

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      likes,
      photos,
      downloads,
    };
  }
}