import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';

/**
 * Caso de uso: Verificar si un restaurante es favorito
 */
export class CheckIsFavoriteUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(clientId: number, restaurantId: number): Promise<boolean> {
    return await this.favoriteRepository.existsByClientAndRestaurant(
      clientId,
      restaurantId
    );
  }
}