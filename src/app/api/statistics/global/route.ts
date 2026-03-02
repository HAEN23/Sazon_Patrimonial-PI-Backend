import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetGlobalStatsUseCase } from '@/core/application/use-cases/statistics/GetGlobalStats.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await adminMiddleware(request);

    const userRepository = new PrismaUserRepository();
    const restaurantRepository = new PrismaRestaurantRepository();
    const favoriteRepository = new PrismaFavoriteRepository();
    const menuRepository = new PrismaMenuRepository();

    const useCase = new GetGlobalStatsUseCase(
      userRepository,
      restaurantRepository,
      favoriteRepository,
      menuRepository
    );

    const result = await useCase.execute();

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}