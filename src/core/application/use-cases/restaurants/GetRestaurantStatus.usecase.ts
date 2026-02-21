import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface RestaurantStatsResult {
  restaurantId: number;
  restaurantName: string;
  likes: number;
  userPhotos: number;
  menuDownloads: number;
  createdAt: Date;
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
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(restaurantId);
    }

    const [likesCount, userPhotosCount, menuDownloads] = await Promise.all([
      this.favoriteRepository.countByRestaurant(restaurantId),
      this.userPhotoRepository.countByRestaurant(restaurantId),
      this.menuRepository.getTotalDownloadsByRestaurant(restaurantId),
    ]);

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      likes: likesCount,
      userPhotos: userPhotosCount,
      menuDownloads,
      createdAt: restaurant.createdAt,
    };
  }
}