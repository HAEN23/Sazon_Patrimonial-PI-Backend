import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { CreateApplicationUseCase } from '@/core/application/use-cases/applications/CreateApplication.usecase';
import { PrismaApplicationRepository } from '@/core/infrastructure/database/repositories/PrismaApplicationRepository';
import { PrismaRestaurantOwnerRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantOwnerRepository';

/**
 * POST /api/applications
 * Crear solicitud de restaurante
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const body = await request.json();

    const applicationRepository = new PrismaApplicationRepository();
    const restaurantOwnerRepository = new PrismaRestaurantOwnerRepository();

    const useCase = new CreateApplicationUseCase(
      applicationRepository,
      restaurantOwnerRepository
    );

    const result = await useCase.execute({
      ...body,
      ownerId: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Solicitud creada exitosamente',
    }, { status: 201 });
  })(request);
}