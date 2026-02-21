import { UserPhoto } from '../entities/UserPhoto.entity';

/**
 * Interface para el repositorio de fotos de usuarios
 */
export interface IUserPhotoRepository {
  /**
   * Obtener todas las fotos
   */
  findAll(): Promise<UserPhoto[]>;

  /**
   * Buscar foto por ID
   */
  findById(id: number): Promise<UserPhoto | null>;

  /**
   * Buscar todas las fotos de un cliente
   */
  findByClientId(clientId: number): Promise<UserPhoto[]>;

  /**
   * Buscar todas las fotos de un restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<UserPhoto[]>;

  /**
   * Guardar una nueva foto
   */
  save(photo: UserPhoto): Promise<UserPhoto>;

  /**
   * Eliminar una foto
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar fotos de un restaurante
   */
  countByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Contar fotos de un cliente
   */
  countByClient(clientId: number): Promise<number>;

  /**
   * Obtener fotos recientes de un restaurante
   */
  findRecentByRestaurant(restaurantId: number, limit: number): Promise<UserPhoto[]>;

  /**
   * Obtener restaurantes con más fotos de usuarios
   */
  findRestaurantsWithMostPhotos(limit: number): Promise<Array<{ restaurantId: number; count: number }>>;
}