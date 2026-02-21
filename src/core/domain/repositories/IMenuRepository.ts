import { Menu } from '../entities/Menu.entity';
import { MenuStatus } from '../enums/MenuStatus.enum';

/**
 * Interface para el repositorio de menús
 */
export interface IMenuRepository {
  /**
   * Obtener todos los menús
   */
  findAll(): Promise<Menu[]>;

  /**
   * Buscar menú por ID
   */
  findById(id: number): Promise<Menu | null>;

  /**
   * Buscar menús por restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<Menu[]>;

  /**
   * Buscar menús por propietario
   */
  findByOwnerId(ownerId: number): Promise<Menu[]>;

  /**
   * Buscar menús por estado
   */
  findByStatus(status: MenuStatus): Promise<Menu[]>;

  /**
   * Buscar menú activo de un restaurante
   */
  findActiveByRestaurant(restaurantId: number): Promise<Menu | null>;

  /**
   * Guardar un nuevo menú
   */
  save(menu: Menu): Promise<Menu>;

  /**
   * Actualizar un menú existente
   */
  update(menu: Menu): Promise<Menu>;

  /**
   * Eliminar un menú
   */
  delete(id: number): Promise<boolean>;

  /**
   * Incrementar contador de descargas
   */
  incrementDownloadCount(id: number): Promise<void>;

  /**
   * Obtener total de descargas de un restaurante
   */
  getTotalDownloadsByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Obtener menús más descargados
   */
  findMostDownloaded(limit: number): Promise<Menu[]>;

  /**
   * Contar menús por estado
   */
  countByStatus(status: MenuStatus): Promise<number>;
}