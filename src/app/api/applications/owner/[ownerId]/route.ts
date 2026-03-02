import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetApplicationsByOwnerUseCase } from '@/core/application/use-cases/applications/GetApplicationsByOwner.usecase';
import { PrismaApplicationRepository } from '@/core/infrastructure/database/repositories/PrismaApplicationRepository';

/**
 * GET /api/applications/owner/:ownerId
 * Obtener solicitudes de un propietario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ownerId: string } }
) {
  return withErrorHandler(async () => {
    await authMiddleware(request);
    const ownerId = parseInt(params.ownerId);

    const applicationRepository = new PrismaApplicationRepository();
    const useCase = new GetApplicationsByOwnerUseCase(applicationRepository);

    const result = await useCase.execute(ownerId);

    return NextResponse.json({
      success: true,
      data: result.applications,
      total: result.total,
    });
  })(request);
}