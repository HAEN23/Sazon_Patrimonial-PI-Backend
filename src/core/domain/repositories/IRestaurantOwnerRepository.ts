import { RestaurantOwner } from '../entities/RestaurantOwner.entity';

/**
 * Interface para el repositorio de restauranteros
 */
export interface IRestaurantOwnerRepository {
  /**
   * Obtener todos los restauranteros
   */
  findAll(): Promise<RestaurantOwner[]>;

  /**
   * Buscar restaurantero por user ID
   */
  findByUserId(userId: number): Promise<RestaurantOwner | null>;

  /**
   * Guardar un nuevo restaurantero
   */
  save(owner: RestaurantOwner): Promise<RestaurantOwner>;

  /**
   * Eliminar un restaurantero
   */
  delete(userId: number): Promise<boolean>;

  /**
   * Verificar si existe un restaurantero
   */
  existsByUserId(userId: number): Promise<boolean>;

  /**
   * Contar total de restauranteros
   */
  count(): Promise<number>;
}