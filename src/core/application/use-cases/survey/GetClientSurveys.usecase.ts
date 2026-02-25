import { ISurveyRepository } from '@/core/domain/repositories/ISurveyRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetClientSurveysResult {
  surveys: Array<{
    id: number;
    restaurantId: number;
    restaurantName: string;
    isComplete: boolean;
    completionPercentage: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener encuestas de un cliente
 */
export class GetClientSurveysUseCase {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(clientId: number): Promise<GetClientSurveysResult> {
    const surveys = await this.surveyRepository.findByClientId(clientId);

    const surveysData = await Promise.all(
      surveys.map(async (survey) => {
        const restaurant = await this.restaurantRepository.findById(survey.restaurantId);
        
        return {
          id: survey.id,
          restaurantId: survey.restaurantId,
          restaurantName: restaurant?.name || 'Desconocido',
          isComplete: survey.isComplete(),
          completionPercentage: survey.getCompletionPercentage(),
          createdAt: survey.createdAt,
        };
      })
    );

    return {
      surveys: surveysData,
      total: surveys.length,
    };
  }
}