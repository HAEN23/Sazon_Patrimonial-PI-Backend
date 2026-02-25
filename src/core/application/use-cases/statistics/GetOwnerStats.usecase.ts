import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';

export interface OwnerStatsResult {
  restaurants: {
    total: number;
    list: Array<{
      id: number;
      name: string;
      likes: number;
      photos: number;
      downloads: number;
    }>;
  };
  totals: {
    totalLikes: number;
    totalPhotos: number;
    totalDownloads: number;
  };
}

/**
 * Caso de uso: Obtener estadísticas de un restaurantero
 */
export class GetOwnerStatsUseCase {
  constructor(
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly menuRepository: IMenuRepository
  ) {}

  async execute(ownerId: number): Promise<OwnerStatsResult> {
    // Obtener restaurantes del propietario
    const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);

    // Obtener estadísticas de cada restaurante
    const restaurantStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const [likes, photos, downloads] = await Promise.all([
          this.favoriteRepository.countByRestaurant(restaurant.id),
          this.userPhotoRepository.countByRestaurant(restaurant.id),
          this.menuRepository.getTotalDownloadsByRestaurant(restaurant.id),
        ]);

        return {
          id: restaurant.id,
          name: restaurant.name,
          likes,
          photos,
          downloads,
        };
      })
    );

    // Calcular totales
    const totalLikes = restaurantStats.reduce((sum, r) => sum + r.likes, 0);
    const totalPhotos = restaurantStats.reduce((sum, r) => sum + r.photos, 0);
    const totalDownloads = restaurantStats.reduce((sum, r) => sum + r.downloads, 0);

    return {
      restaurants: {
        total: restaurants.length,
        list: restaurantStats,
      },
      totals: {
        totalLikes,
        totalPhotos,
        totalDownloads,
      },
    };
  }
}