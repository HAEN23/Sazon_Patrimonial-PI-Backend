import { NextRequest } from 'next/server';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';

/**
 * Middleware para verificar que el cliente tiene like en el restaurante
 */
export async function likeRequiredMiddleware(
  request: NextRequest,
  clientId: number,
  restaurantId: number,
  favoriteRepository: IFavoriteRepository
) {
  const hasFavorite = await favoriteRepository.existsByClientAndRestaurant(
    clientId,
    restaurantId
  );

  if (!hasFavorite) {
    throw ForbiddenException.likeRequired();
  }

  return true;
}