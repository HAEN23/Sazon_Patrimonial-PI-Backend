import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { ApproveApplicationUseCase } from '@/core/application/use-cases/applications/ApproveApplication.usecase';
import { PrismaApplicationRepository } from '@/core/infrastructure/database/repositories/PrismaApplicationRepository';

/**
 * POST /api/applications/:id/approve
 * Aprobar solicitud (solo admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const admin = await adminMiddleware(request);
    const applicationId = parseInt(params.id);

    const applicationRepository = new PrismaApplicationRepository();
    const useCase = new ApproveApplicationUseCase(applicationRepository);

    await useCase.execute({
      applicationId,
      approvedBy: admin.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
    });
  })(request);
}