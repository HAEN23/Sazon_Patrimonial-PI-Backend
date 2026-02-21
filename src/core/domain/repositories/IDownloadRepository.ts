import { Download } from '../entities/Download.entity';
import { DownloadOrigin } from '../enums/DownloadOrigin.enum';

/**
 * Interface para el repositorio de descargas
 */
export interface IDownloadRepository {
  /**
   * Obtener todas las descargas
   */
  findAll(): Promise<Download[]>;

  /**
   * Buscar descarga por ID
   */
  findById(id: number): Promise<Download | null>;

  /**
   * Buscar descargas por propietario
   */
  findByOwnerId(ownerId: number): Promise<Download[]>;

  /**
   * Buscar descargas por origen
   */
  findByOrigin(origin: DownloadOrigin): Promise<Download[]>;

  /**
   * Guardar una nueva descarga
   */
  save(download: Download): Promise<Download>;

  /**
   * Actualizar una descarga existente
   */
  update(download: Download): Promise<Download>;

  /**
   * Eliminar una descarga
   */
  delete(id: number): Promise<boolean>;

  /**
   * Obtener total de descargas por origen
   */
  countByOrigin(origin: DownloadOrigin): Promise<number>;

  /**
   * Obtener estadísticas de descargas
   */
  getStats(): Promise<{
    total: number;
    national: number;
    foreign: number;
  }>;
}