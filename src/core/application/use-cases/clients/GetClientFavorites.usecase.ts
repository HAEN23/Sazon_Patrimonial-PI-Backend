import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetClientFavoritesResult {
  favorites: Array<{
    id: number;
    restaurantId: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los favoritos de un cliente
 */
export class GetClientFavoritesUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly favoriteRepository: IFavoriteRepository
  ) {}

  async execute(clientId: number): Promise<GetClientFavoritesResult> {
    // 1. Verificar que el cliente existe
    const client = await this.clientRepository.findByUserId(clientId);
    if (!client) {
      throw NotFoundException.clientNotFound(clientId);
    }

    // 2. Obtener favoritos
    const favorites = await this.favoriteRepository.findByClientId(clientId);

    // 3. Mapear resultados
    const favoritesData = favorites.map(fav => ({
      id: fav.id,
      restaurantId: fav.restaurantId,
      createdAt: fav.createdAt,
    }));

    return {
      favorites: favoritesData,
      total: favorites.length,
    };
  }
}