import { User } from '../entities/User.entity';

/**
 * Interface para el repositorio de usuarios
 * Define el contrato que debe cumplir cualquier implementación
 */
export interface IUserRepository {
  /**
   * Obtener todos los usuarios
   */
  findAll(): Promise<User[]>;

  /**
   * Buscar usuario por ID
   */
  findById(id: number): Promise<User | null>;

  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Buscar usuarios por tipo
   */
  findByType(type: string): Promise<User[]>;

  /**
   * Guardar un nuevo usuario
   */
  save(user: User): Promise<User>;

  /**
   * Actualizar un usuario existente
   */
  update(user: User): Promise<User>;

  /**
   * Eliminar un usuario
   */
  delete(id: number): Promise<boolean>;

  /**
   * Verificar si existe un usuario con un email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Contar total de usuarios
   */
  count(): Promise<number>;

  /**
   * Contar usuarios por tipo
   */
  countByType(type: string): Promise<number>;
}