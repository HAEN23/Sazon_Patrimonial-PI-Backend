import { Favorite } from '../entities/Favorite.entity';

/**
 * Interface para el repositorio de favoritos
 */
export interface IFavoriteRepository {
  /**
   * Obtener todos los favoritos
   */
  findAll(): Promise<Favorite[]>;

  /**
   * Buscar favorito por ID
   */
  findById(id: number): Promise<Favorite | null>;

  /**
   * Buscar todos los favoritos de un cliente
   */
  findByClientId(clientId: number): Promise<Favorite[]>;

  /**
   * Buscar todos los favoritos de un restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<Favorite[]>;

  /**
   * Buscar favorito específico de cliente y restaurante
   */
  findByClientAndRestaurant(
    clientId: number,
    restaurantId: number
  ): Promise<Favorite | null>;

  /**
   * Guardar un nuevo favorito
   */
  save(favorite: Favorite): Promise<Favorite>;

  /**
   * Eliminar un favorito
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar favoritos de un restaurante
   */
  countByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Contar favoritos de un cliente
   */
  countByClient(clientId: number): Promise<number>;

  /**
   * Verificar si existe un favorito
   */
  existsByClientAndRestaurant(
    clientId: number,
    restaurantId: number
  ): Promise<boolean>;

  /**
   * Obtener restaurantes más agregados a favoritos
   */
  findMostFavorited(limit: number): Promise<Array<{ restaurantId: number; count: number }>>;
}