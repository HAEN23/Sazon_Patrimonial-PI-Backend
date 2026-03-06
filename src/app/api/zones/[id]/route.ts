import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { UpdateZoneUseCase } from '@/core/application/use-cases/zones/UpdateZone.usecase';
import { DeleteZoneUseCase } from '@/core/application/use-cases/zones/DeleteZone.usecase';
import { PrismaZoneRepository } from '@/core/infrastructure/database/repositories/PrismaZoneRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * PUT /api/zones/:id
 * Actualizar zona
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const zoneId = parseInt(params.id);
    const body = await request.json();

    const zoneRepository = new PrismaZoneRepository();
    const useCase = new UpdateZoneUseCase(zoneRepository);

    await useCase.execute({
      zoneId,
      requesterId: user.userId,
      requesterType: user.type as UserType,
      name: body.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Zona actualizada exitosamente',
    });
  })(request);
}

/**
 * DELETE /api/zones/:id
 * Eliminar zona
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const zoneId = parseInt(params.id);

    const zoneRepository = new PrismaZoneRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new DeleteZoneUseCase(zoneRepository, restaurantRepository);

    await useCase.execute({
      zoneId,
      requesterId: user.userId,
      requesterType: user.type as UserType,
    });

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada exitosamente',
    });
  })(request);
}