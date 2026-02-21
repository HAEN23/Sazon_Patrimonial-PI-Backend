import { Client } from '../entities/Client.entity';

/**
 * Interface para el repositorio de clientes
 */
export interface IClientRepository {
  /**
   * Obtener todos los clientes
   */
  findAll(): Promise<Client[]>;

  /**
   * Buscar cliente por user ID
   */
  findByUserId(userId: number): Promise<Client | null>;

  /**
   * Guardar un nuevo cliente
   */
  save(client: Client): Promise<Client>;

  /**
   * Actualizar un cliente existente
   */
  update(client: Client): Promise<Client>;

  /**
   * Eliminar un cliente
   */
  delete(userId: number): Promise<boolean>;

  /**
   * Verificar si existe un cliente
   */
  existsByUserId(userId: number): Promise<boolean>;

  /**
   * Contar total de clientes
   */
  count(): Promise<number>;

  /**
   * Obtener clientes más activos (con más favoritos)
   */
  findMostActive(limit: number): Promise<Client[]>;
}