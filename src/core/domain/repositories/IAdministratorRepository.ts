import { Administrator } from '../entities/Administrador.entity';

/**
 * Interface para el repositorio de administradores
 */
export interface IAdministratorRepository {
  /**
   * Obtener todos los administradores
   */
  findAll(): Promise<Administrator[]>;

  /**
   * Buscar administrador por user ID
   */
  findByUserId(userId: number): Promise<Administrator | null>;

  /**
   * Guardar un nuevo administrador
   */
  save(administrator: Administrator): Promise<Administrator>;

  /**
   * Eliminar un administrador
   */
  delete(userId: number): Promise<boolean>;

  /**
   * Verificar si existe un administrador
   */
  existsByUserId(userId: number): Promise<boolean>;

  /**
   * Contar total de administradores
   */
  count(): Promise<number>;
}