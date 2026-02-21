import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { Favorite } from '@/core/domain/entities/Favorite.entity';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface ToggleFavoriteResult {
  isFavorite: boolean;
  likesCount: number;
}

/**
 * Caso de uso: Dar/Quitar like (Toggle Favorite)
 */
export class ToggleFavoriteUseCase {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(clientId: number, restaurantId: number): Promise<ToggleFavoriteResult> {
    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(restaurantId);
    }

    // Verificar si ya es favorito
    const existingFavorite = await this.favoriteRepository.findByClientAndRestaurant(
      clientId,
      restaurantId
    );

    let isFavorite: boolean;
    let likesCount: number;

    if (existingFavorite) {
      // Quitar like
      await this.favoriteRepository.delete(existingFavorite.id);
      likesCount = await this.restaurantRepository.decrementLikesCount(restaurantId);
      isFavorite = false;
    } else {
      // Dar like
      const favorite = Favorite.create(clientId, restaurantId);
      await this.favoriteRepository.save(favorite);
      likesCount = await this.restaurantRepository.incrementLikesCount(restaurantId);
      isFavorite = true;
    }

    return { isFavorite, likesCount };
  }
}