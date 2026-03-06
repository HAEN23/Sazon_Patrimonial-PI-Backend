import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { UpdateMenuUseCase } from '@/core/application/use-cases/menus/UpdateMenu.usecase';
import { DeleteMenuUseCase } from '@/core/application/use-cases/menus/DeleteMenu.usecase';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { CloudinaryStorage } from '@/core/infrastructure/storage/CloudinaryStorage';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * PUT /api/menus/:id
 * Actualizar menú
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const menuId = parseInt(params.id);
    const body = await request.json();

    const menuRepository = new PrismaMenuRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new UpdateMenuUseCase(menuRepository, restaurantRepository);

    await useCase.execute({
      menuId,
      requesterId: user.userId,
      requesterType: user.type as UserType,
      ...body,
    });

    return NextResponse.json({
      success: true,
      message: 'Menú actualizado exitosamente',
    });
  })(request);
}

/**
 * DELETE /api/menus/:id
 * Eliminar menú
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const menuId = parseInt(params.id);

    const menuRepository = new PrismaMenuRepository();
    const restaurantRepository = new PrismaRestaurantRepository();
    const fileStorage = new CloudinaryStorage();

    const useCase = new DeleteMenuUseCase(
      menuRepository,
      restaurantRepository,
      fileStorage
    );

    await useCase.execute({
      menuId,
      requesterId: user.userId,
      requesterType: user.type as UserType,
    });

    return NextResponse.json({
      success: true,
      message: 'Menú eliminado exitosamente',
    });
  })(request);
}