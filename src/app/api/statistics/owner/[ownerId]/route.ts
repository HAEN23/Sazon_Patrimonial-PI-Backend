import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetOwnerStatsUseCase } from '@/core/application/use-cases/statistics/GetOwnerStats.usecase';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';

export async function GET(
  request: NextRequest,
  { params }: { params: { ownerId: string } }
) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const ownerId = parseInt(params.ownerId);

    const restaurantRepository = new PrismaRestaurantRepository();
    const favoriteRepository = new PrismaFavoriteRepository();
    const userPhotoRepository = new PrismaUserPhotoRepository();
    const menuRepository = new PrismaMenuRepository();

    const useCase = new GetOwnerStatsUseCase(
      restaurantRepository,
      favoriteRepository,
      userPhotoRepository,
      menuRepository
    );

    const result = await useCase.execute(ownerId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}