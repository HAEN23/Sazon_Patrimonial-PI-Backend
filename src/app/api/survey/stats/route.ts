import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetSurveyStatsUseCase } from '@/core/application/use-cases/survey/GetSurveyStats.usecase';
import { PrismaSurveyRepository } from '@/core/infrastructure/database/repositories/PrismaSurveyRepository';

/**
 * GET /api/survey/stats?restaurantId=123
 * Obtener estadísticas de encuestas
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await adminMiddleware(request);

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId')
      ? parseInt(searchParams.get('restaurantId')!)
      : undefined;

    const surveyRepository = new PrismaSurveyRepository();
    const useCase = new GetSurveyStatsUseCase(surveyRepository);

    const result = await useCase.execute(restaurantId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}