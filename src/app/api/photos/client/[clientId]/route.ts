import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { GetUserPhotosByClientUseCase } from '@/core/application/use-cases/user-photos/GetUserPhotosByClient.usecase';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

/**
 * GET /api/photos/client/:clientId
 * Obtener fotos de un cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  return withErrorHandler(async () => {
    await clientAuthMiddleware(request);
    const clientId = parseInt(params.clientId);

    const userPhotoRepository = new PrismaUserPhotoRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new GetUserPhotosByClientUseCase(
      userPhotoRepository,
      restaurantRepository
    );

    const result = await useCase.execute(clientId);

    return NextResponse.json({
      success: true,
      data: result.photos,
      total: result.total,
    });
  })(request);
}