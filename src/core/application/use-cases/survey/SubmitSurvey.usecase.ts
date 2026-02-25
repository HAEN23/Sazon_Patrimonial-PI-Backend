import { ISurveyRepository } from '@/core/domain/repositories/ISurveyRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { Survey } from '@/core/domain/entities/Survey.entity';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';

export interface SubmitSurveyDto {
  clientId: number;
  restaurantId: number;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
}

export interface SubmitSurveyResult {
  surveyId: number;
  isComplete: boolean;
  completionPercentage: number;
}

/**
 * Caso de uso: Responder encuesta
 */
export class SubmitSurveyUseCase {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly clientRepository: IClientRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(dto: SubmitSurveyDto): Promise<SubmitSurveyResult> {
    // 1. Verificar que el cliente existe
    const client = await this.clientRepository.findByUserId(dto.clientId);
    if (!client) {
      throw NotFoundException.clientNotFound(dto.clientId);
    }

    // 2. Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(dto.restaurantId);
    }

    // 3. Verificar que no haya respondido ya esta encuesta
    const existingSurvey = await this.surveyRepository.existsByClientAndRestaurant(
      dto.clientId,
      dto.restaurantId
    );

    if (existingSurvey) {
      throw ConflictException.surveyAlreadySubmitted();
    }

    // 4. Crear encuesta
    const survey = Survey.create(dto);

    const savedSurvey = await this.surveyRepository.save(survey);

    return {
      surveyId: savedSurvey.id,
      isComplete: savedSurvey.isComplete(),
      completionPercentage: savedSurvey.getCompletionPercentage(),
    };
  }
}