import { Restaurant } from '../entities/Restaurant.entity';

/**
 * Interface para el repositorio de restaurantes
 */
export interface IRestaurantRepository {
  /**
   * Obtener todos los restaurantes
   */
  findAll(): Promise<Restaurant[]>;

  /**
   * Buscar restaurante por ID
   */
  findById(id: number): Promise<Restaurant | null>;

  /**
   * Buscar restaurantes por propietario
   */
  findByOwnerId(ownerId: number): Promise<Restaurant[]>;

  /**
   * Buscar restaurantes por zona
   */
  findByZoneId(zoneId: number): Promise<Restaurant[]>;

  /**
   * Buscar restaurantes por tags
   */
  findByTags(tags: string[]): Promise<Restaurant[]>;

  /**
   * Guardar un nuevo restaurante
   */
  save(restaurant: Restaurant): Promise<Restaurant>;

  /**
   * Actualizar un restaurante existente
   */
  update(restaurant: Restaurant): Promise<Restaurant>;

  /**
   * Eliminar un restaurante
   */
  delete(id: number): Promise<boolean>;

  /**
   * Incrementar contador de likes
   */
  incrementLikesCount(id: number): Promise<number>;

  /**
   * Decrementar contador de likes
   */
  decrementLikesCount(id: number): Promise<number>;

  /**
   * Verificar si existe un restaurante con una solicitud
   */
  existsByApplicationId(applicationId: number): Promise<boolean>;

  /**
   * Contar total de restaurantes
   */
  count(): Promise<number>;

  /**
   * Obtener restaurantes más populares (con más likes)
   */
  findMostPopular(limit: number): Promise<Restaurant[]>;

  /**
   * Buscar restaurantes por nombre
   */
  searchByName(name: string): Promise<Restaurant[]>;
}