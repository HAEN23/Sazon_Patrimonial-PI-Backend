import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { CheckIsFavoriteUseCase } from '@/core/application/use-cases/favorites/CheckIsFavorite.usecase';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '0');

    const favoriteRepository = new PrismaFavoriteRepository();
    const useCase = new CheckIsFavoriteUseCase(favoriteRepository);

    const isFavorite = await useCase.execute(client.clientId, restaurantId);

    return NextResponse.json({
      success: true,
      data: { isFavorite },
    });
  })(request);
}