import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { GetRestaurantStatsUseCase } from '@/core/application/use-cases/restaurants/GetRestaurantStats.usecase';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const restaurantId = parseInt(params.id);

    const restaurantRepository = new PrismaRestaurantRepository();
    const favoriteRepository = new PrismaFavoriteRepository();
    const userPhotoRepository = new PrismaUserPhotoRepository();
    const menuRepository = new PrismaMenuRepository();

    const useCase = new GetRestaurantStatsUseCase(
      restaurantRepository,
      favoriteRepository,
      userPhotoRepository,
      menuRepository
    );

    const result = await useCase.execute(restaurantId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}