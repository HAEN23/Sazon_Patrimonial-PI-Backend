import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { toggleFavoriteSchema } from '@/core/infrastructure/http/validators/favorite.validator';
import { ToggleFavoriteUseCase } from '@/core/application/use-cases/favorites/ToggleFavorite.usecase';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

interface ToggleFavoriteDto {
  restaurantId: number;
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    const body = await validateBody<ToggleFavoriteDto>(request, toggleFavoriteSchema);

    const favoriteRepository = new PrismaFavoriteRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new ToggleFavoriteUseCase(
      favoriteRepository,
      restaurantRepository
    );

    const result = await useCase.execute(client.clientId, body.restaurantId);

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isFavorite ? 'Like agregado' : 'Like removido',
    });
  })(request);
}