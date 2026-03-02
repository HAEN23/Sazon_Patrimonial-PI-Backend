import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { z } from 'zod';
import { SubmitSurveyUseCase } from '@/core/application/use-cases/survey/SubmitSurvey.usecase';
import { PrismaSurveyRepository } from '@/core/infrastructure/database/repositories/PrismaSurveyRepository';
import { PrismaClientRepository } from '@/core/infrastructure/database/repositories/PrismaClientRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';

// Validador de encuesta
const submitSurveySchema = z.object({
  restaurantId: z.number().int().positive(),
  question1: z.string().max(500).optional(),
  question2: z.string().max(500).optional(),
  question3: z.string().max(500).optional(),
  question4: z.string().max(500).optional(),
  question5: z.string().max(500).optional(),
});

/**
 * POST /api/survey
 * Enviar encuesta de satisfacción
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    const body = await validateBody(request, submitSurveySchema);

    const surveyRepository = new PrismaSurveyRepository();
    const clientRepository = new PrismaClientRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new SubmitSurveyUseCase(
      surveyRepository,
      clientRepository,
      restaurantRepository
    );

    const result = await useCase.execute({
      clientId: client.clientId,
      ...body,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Encuesta enviada exitosamente. ¡Gracias por tu feedback!',
    }, { status: 201 });
  })(request);
}