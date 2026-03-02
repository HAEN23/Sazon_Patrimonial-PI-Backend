import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { GetMenusByRestaurantUseCase } from '@/core/application/use-cases/menus/GetMenusByRestaurant.usecase';
import { GetActiveMenuByRestaurantUseCase } from '@/core/application/use-cases/menus/GetActiveMenuByRestaurant.usecase';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';

/**
 * GET /api/menus/restaurant/:restaurantId
 * Obtener menús de un restaurante
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  return withErrorHandler(async () => {
    const restaurantId = parseInt(params.restaurantId);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const menuRepository = new PrismaMenuRepository();

    if (activeOnly) {
      const useCase = new GetActiveMenuByRestaurantUseCase(menuRepository);
      const result = await useCase.execute(restaurantId);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      const useCase = new GetMenusByRestaurantUseCase(menuRepository);
      const result = await useCase.execute(restaurantId);

      return NextResponse.json({
        success: true,
        data: result.menus,
        total: result.total,
      });
    }
  })(request);
}