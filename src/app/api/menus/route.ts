import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { createMenuSchema } from '@/core/infrastructure/http/validators/menu.validator';
import { CreateMenuUseCase } from '@/core/application/use-cases/menus/CreateMenu.usecase';
import { GetMenusByOwnerUseCase } from '@/core/application/use-cases/menus/GetMenusByOwner.usecase';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

/**
 * GET /api/menus?ownerId=123
 * Obtener menús de un propietario
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const { searchParams } = new URL(request.url);
    const ownerId = parseInt(searchParams.get('ownerId') || user.userId.toString());

    const menuRepository = new PrismaMenuRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new GetMenusByOwnerUseCase(menuRepository, restaurantRepository);
    const result = await useCase.execute(ownerId);

    return NextResponse.json({
      success: true,
      data: result.menus,
      total: result.total,
    });
  })(request);
}

/**
 * POST /api/menus
 * Crear menú
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const body = await validateBody(request, createMenuSchema);

    const menuRepository = new PrismaMenuRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new CreateMenuUseCase(menuRepository, restaurantRepository);
    
    const result = await useCase.execute({
      ...body,
      requesterId: user.userId,
      requesterType: user.type,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Menú creado exitosamente',
    }, { status: 201 });
  })(request);
}