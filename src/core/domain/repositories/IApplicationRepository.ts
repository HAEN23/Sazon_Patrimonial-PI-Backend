import { Application } from '../entities/Application.entity';
import { ApplicationStatus } from '../enums/ApplicationStatus.enum';

/**
 * Interface para el repositorio de solicitudes
 */
export interface IApplicationRepository {
  /**
   * Obtener todas las solicitudes
   */
  findAll(): Promise<Application[]>;

  /**
   * Buscar solicitud por ID
   */
  findById(id: number): Promise<Application | null>;

  /**
   * Buscar solicitudes por propietario
   */
  findByOwnerId(ownerId: number): Promise<Application[]>;

  /**
   * Buscar solicitudes por estado
   */
  findByStatus(status: ApplicationStatus): Promise<Application[]>;

  /**
   * Guardar una nueva solicitud
   */
  save(application: Application): Promise<Application>;

  /**
   * Actualizar una solicitud existente
   */
  update(application: Application): Promise<Application>;

  /**
   * Eliminar una solicitud
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar solicitudes por estado
   */
  countByStatus(status: ApplicationStatus): Promise<number>;

  /**
   * Obtener solicitudes pendientes
   */
  findPending(): Promise<Application[]>;

  /**
   * Obtener solicitudes recientes
   */
  findRecent(limit: number): Promise<Application[]>;
}