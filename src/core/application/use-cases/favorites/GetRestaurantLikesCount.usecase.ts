import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';

/**
 * Caso de uso: Obtener contador de likes de un restaurante
 */
export class GetRestaurantLikesCountUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(restaurantId: number): Promise<number> {
    return await this.favoriteRepository.countByRestaurant(restaurantId);
  }
}