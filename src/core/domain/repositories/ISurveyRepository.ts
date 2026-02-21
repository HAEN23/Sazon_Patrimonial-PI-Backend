import { Survey } from '../entities/Survey.entity';

/**
 * Interface para el repositorio de encuestas
 */
export interface ISurveyRepository {
  /**
   * Obtener todas las encuestas
   */
  findAll(): Promise<Survey[]>;

  /**
   * Buscar encuesta por ID
   */
  findById(id: number): Promise<Survey | null>;

  /**
   * Buscar encuestas por cliente
   */
  findByClientId(clientId: number): Promise<Survey[]>;

  /**
   * Buscar encuestas por restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<Survey[]>;

  /**
   * Guardar una nueva encuesta
   */
  save(survey: Survey): Promise<Survey>;

  /**
   * Eliminar una encuesta
   */
  delete(id: number): Promise<boolean>;

  /**
   * Verificar si un cliente ya respondió encuesta
   */
  existsByClientId(clientId: number): Promise<boolean>;

  /**
   * Verificar si un cliente respondió para un restaurante
   */
  existsByClientAndRestaurant(clientId: number, restaurantId: number): Promise<boolean>;

  /**
   * Contar encuestas completadas
   */
  countCompleted(): Promise<number>;

  /**
   * Contar encuestas por restaurante
   */
  countByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Obtener encuestas recientes
   */
  findRecent(limit: number): Promise<Survey[]>;
}