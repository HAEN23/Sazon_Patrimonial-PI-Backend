import { ISurveyRepository } from '@/core/domain/repositories/ISurveyRepository';

export interface SurveyStatsResult {
  totalSurveys: number;
  completedSurveys: number;
  completionRate: number;
  byRestaurant: Array<{
    restaurantId: number;
    count: number;
  }>;
}

/**
 * Caso de uso: Obtener estadísticas de encuestas
 */
export class GetSurveyStatsUseCase {
  constructor(private readonly surveyRepository: ISurveyRepository) {}

  async execute(restaurantId?: number): Promise<SurveyStatsResult> {
    let surveys;

    if (restaurantId) {
      surveys = await this.surveyRepository.findByRestaurantId(restaurantId);
    } else {
      surveys = await this.surveyRepository.findAll();
    }

    const totalSurveys = surveys.length;
    const completedSurveys = surveys.filter(s => s.isComplete()).length;
    const completionRate = totalSurveys > 0 
      ? (completedSurveys / totalSurveys) * 100 
      : 0;

    // Agrupar por restaurante
    const byRestaurant: Map<number, number> = new Map();
    surveys.forEach(survey => {
      const count = byRestaurant.get(survey.restaurantId) || 0;
      byRestaurant.set(survey.restaurantId, count + 1);
    });

    const byRestaurantArray = Array.from(byRestaurant.entries()).map(([restaurantId, count]) => ({
      restaurantId,
      count,
    }));

    return {
      totalSurveys,
      completedSurveys,
      completionRate: Math.round(completionRate * 100) / 100,
      byRestaurant: byRestaurantArray,
    };
  }
}