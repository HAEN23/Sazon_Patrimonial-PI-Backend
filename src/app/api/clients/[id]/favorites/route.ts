import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { GetClientFavoritesUseCase } from '@/core/application/use-cases/favorites/GetClientFavorites.usecase';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

/**
 * GET /api/clients/:id/favorites
 * Obtener restaurantes favoritos del cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const authenticatedClient = await clientAuthMiddleware(request);
    const clientId = parseInt(params.id);

    // Verificar que el cliente solo pueda ver sus propios favoritos
    if (authenticatedClient.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para ver estos favoritos' },
        { status: 403 }
      );
    }

    const favoriteRepository = new PrismaFavoriteRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new GetClientFavoritesUseCase(
      favoriteRepository,
      restaurantRepository
    );

    const result = await useCase.execute(clientId);

    return NextResponse.json({
      success: true,
      data: result.favorites,
      total: result.total,
      message: result.total === 0 ? 'No tienes restaurantes favoritos' : undefined,
    });
  })(request);
}