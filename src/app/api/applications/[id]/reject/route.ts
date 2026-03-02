import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { RejectApplicationUseCase } from '@/core/application/use-cases/applications/RejectApplication.usecase';
import { PrismaApplicationRepository } from '@/core/infrastructure/database/repositories/PrismaApplicationRepository';

/**
 * POST /api/applications/:id/reject
 * Rechazar solicitud (solo admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const admin = await adminMiddleware(request);
    const applicationId = parseInt(params.id);
    const body = await request.json();

    const applicationRepository = new PrismaApplicationRepository();
    const useCase = new RejectApplicationUseCase(applicationRepository);

    await useCase.execute({
      applicationId,
      rejectedBy: admin.userId,
      reason: body.reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud rechazada',
    });
  })(request);
}