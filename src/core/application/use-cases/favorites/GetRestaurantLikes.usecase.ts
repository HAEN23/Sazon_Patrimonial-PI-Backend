import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export interface GetRestaurantLikesResult {
  likes: Array<{
    id: number;
    clientId: number;
    clientName: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener lista de usuarios que dieron like
 */
export class GetRestaurantLikesUseCase {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(restaurantId: number): Promise<GetRestaurantLikesResult> {
    const favorites = await this.favoriteRepository.findByRestaurantId(restaurantId);

    const likesData = await Promise.all(
      favorites.map(async (fav) => {
        const user = await this.userRepository.findById(fav.clientId);
        
        return {
          id: fav.id,
          clientId: fav.clientId,
          clientName: user?.name || 'Usuario desconocido',
          createdAt: fav.createdAt,
        };
      })
    );

    return {
      likes: likesData,
      total: likesData.length,
    };
  }
}