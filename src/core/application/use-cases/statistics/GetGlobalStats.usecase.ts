import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface GlobalStatsResult {
  users: {
    total: number;
    clients: number;
    restaurantOwners: number;
    administrators: number;
  };
  restaurants: {
    total: number;
    mostPopular: Array<{
      id: number;
      name: string;
      likesCount: number;
    }>;
  };
  favorites: {
    total: number;
  };
  menus: {
    totalDownloads: number;
  };
}

/**
 * Caso de uso: Obtener estadísticas globales del sistema
 * Solo para administradores
 */
export class GetGlobalStatsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly menuRepository: IMenuRepository
  ) {}

  async execute(): Promise<GlobalStatsResult> {
    // Estadísticas de usuarios
    const [totalUsers, clients, restaurantOwners, administrators] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.countByType(UserType.CLIENT),
      this.userRepository.countByType(UserType.RESTAURANT_OWNER),
      this.userRepository.countByType(UserType.ADMIN),
    ]);

    // Estadísticas de restaurantes
    const totalRestaurants = await this.restaurantRepository.count();
    const mostPopularRestaurants = await this.restaurantRepository.findMostPopular(5);

    // Estadísticas de favoritos
    const allFavorites = await this.favoriteRepository.findAll();
    const totalFavorites = allFavorites.length;

    // Estadísticas de menús (aproximado)
    const allMenus = await this.menuRepository.findAll();
    const totalMenuDownloads = allMenus.reduce((sum, menu) => sum + menu.downloadCount, 0);

    return {
      users: {
        total: totalUsers,
        clients,
        restaurantOwners,
        administrators,
      },
      restaurants: {
        total: totalRestaurants,
        mostPopular: mostPopularRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          likesCount: r.likesCount,
        })),
      },
      favorites: {
        total: totalFavorites,
      },
      menus: {
        totalDownloads: totalMenuDownloads,
      },
    };
  }
}