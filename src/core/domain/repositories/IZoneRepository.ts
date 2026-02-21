import { Zone } from '../entities/Zone.entity';

/**
 * Interface para el repositorio de zonas
 */
export interface IZoneRepository {
  /**
   * Obtener todas las zonas
   */
  findAll(): Promise<Zone[]>;

  /**
   * Buscar zona por ID
   */
  findById(id: number): Promise<Zone | null>;

  /**
   * Buscar zonas por propietario
   */
  findByOwnerId(ownerId: number): Promise<Zone[]>;

  /**
   * Buscar zona por nombre
   */
  findByName(name: string): Promise<Zone | null>;

  /**
   * Guardar una nueva zona
   */
  save(zone: Zone): Promise<Zone>;

  /**
   * Actualizar una zona existente
   */
  update(zone: Zone): Promise<Zone>;

  /**
   * Eliminar una zona
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar zonas
   */
  count(): Promise<number>;

  /**
   * Verificar si existe una zona con ese nombre
   */
  existsByName(name: string): Promise<boolean>;
}