import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetClientFavoritesResult {
  favorites: Array<{
    id: number;
    restaurantId: number;
    restaurant: {
      id: number;
      name: string;
      address: string;
      phone: string;
      likesCount: number;
    };
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener favoritos de un cliente con información del restaurante
 */
export class GetClientFavoritesUseCase {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(clientId: number): Promise<GetClientFavoritesResult> {
    const favorites = await this.favoriteRepository.findByClientId(clientId);

    const favoritesData = await Promise.all(
      favorites.map(async (fav) => {
        const restaurant = await this.restaurantRepository.findById(fav.restaurantId);
        
        return {
          id: fav.id,
          restaurantId: fav.restaurantId,
          restaurant: restaurant
            ? {
                id: restaurant.id,
                name: restaurant.name,
                address: restaurant.address,
                phone: restaurant.phone.getValue(),
                likesCount: restaurant.likesCount,
              }
            : null,
          createdAt: fav.createdAt,
        };
      })
    );

    // Filtrar favoritos sin restaurante (por si fue eliminado)
    const validFavorites = favoritesData.filter(f => f.restaurant !== null);

    return {
      favorites: validFavorites as any,
      total: validFavorites.length,
    };
  }
}