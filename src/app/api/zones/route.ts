import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { createZoneSchema } from '@/core/infrastructure/http/validators/zone.validator';
import { GetAllZonesUseCase } from '@/core/application/use-cases/zones/GetAllZones.usecase';
import { CreateZoneUseCase } from '@/core/application/use-cases/zones/CreateZone.usecase';
import { PrismaZoneRepository } from '@/core/infrastructure/database/repositories/PrismaZoneRepository';

interface CreateZoneBodyDto {
  name: string;
}

/**
 * GET /api/zones
 * Obtener todas las zonas
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const zoneRepository = new PrismaZoneRepository();
    const useCase = new GetAllZonesUseCase(zoneRepository);

    const result = await useCase.execute();

    return NextResponse.json({
      success: true,
      data: result.zones,
      total: result.total,
    });
  })(request);
}

/**
 * POST /api/zones
 * Crear zona
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const body = await validateBody<CreateZoneBodyDto>(request, createZoneSchema);

    const zoneRepository = new PrismaZoneRepository();
    const useCase = new CreateZoneUseCase(zoneRepository);

    const result = await useCase.execute({
      ...body,
      ownerId: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Zona creada exitosamente',
    }, { status: 201 });
  })(request);
}