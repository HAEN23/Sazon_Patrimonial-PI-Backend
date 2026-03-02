import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { GetClientSurveysUseCase } from '@/core/application/use-cases/survey/GetClientSurveys.usecase';
import { PrismaSurveyRepository } from '@/core/infrastructure/database/repositories/PrismaSurveyRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

/**
 * GET /api/survey/client/:clientId
 * Obtener encuestas enviadas por un cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  return withErrorHandler(async () => {
    const authenticatedClient = await clientAuthMiddleware(request);
    const clientId = parseInt(params.clientId);

    // Verificar que el cliente solo pueda ver sus propias encuestas
    if (authenticatedClient.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para ver estas encuestas' },
        { status: 403 }
      );
    }

    const surveyRepository = new PrismaSurveyRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new GetClientSurveysUseCase(
      surveyRepository,
      restaurantRepository
    );

    const result = await useCase.execute(clientId);

    return NextResponse.json({
      success: true,
      data: result.surveys,
      total: result.total,
    });
  })(request);
}