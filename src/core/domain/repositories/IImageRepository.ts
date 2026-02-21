import { Image } from '../entities/Image.entity';

/**
 * Interface para el repositorio de imágenes
 */
export interface IImageRepository {
  /**
   * Obtener todas las imágenes
   */
  findAll(): Promise<Image[]>;

  /**
   * Buscar imagen por ID
   */
  findById(id: number): Promise<Image | null>;

  /**
   * Buscar imágenes por restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<Image[]>;

  /**
   * Buscar imágenes por propietario
   */
  findByOwnerId(ownerId: number): Promise<Image[]>;

  /**
   * Buscar imágenes por solicitud
   */
  findByApplicationId(applicationId: number): Promise<Image[]>;

  /**
   * Guardar una nueva imagen
   */
  save(image: Image): Promise<Image>;

  /**
   * Eliminar una imagen
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar imágenes de un restaurante
   */
  countByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Obtener imagen principal de un restaurante
   */
  findMainByRestaurant(restaurantId: number): Promise<Image | null>;
}