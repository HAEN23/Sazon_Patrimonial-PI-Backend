import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { GetUserPhotosByRestaurantUseCase } from '@/core/application/use-cases/user-photos/GetUserPhotosByRestaurant.usecase';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';

/**
 * GET /api/photos/restaurant/:restaurantId
 * Obtener fotos de un restaurante
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  return withErrorHandler(async () => {
    const restaurantId = parseInt(params.restaurantId);

    const userPhotoRepository = new PrismaUserPhotoRepository();
    const userRepository = new PrismaUserRepository();

    const useCase = new GetUserPhotosByRestaurantUseCase(
      userPhotoRepository,
      userRepository
    );

    const result = await useCase.execute(restaurantId);

    return NextResponse.json({
      success: true,
      data: result.photos,
      total: result.total,
    });
  })(request);
}