import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';

export interface GetAllUsersFilters {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface GetAllUsersResult {
  users: Array<{
    id: number;
    name: string;
    email: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los usuarios
 * Solo para administradores
 */
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(filters?: GetAllUsersFilters): Promise<GetAllUsersResult> {
    // Si hay filtro por tipo, usar ese método
    let users: User[];
    
    if (filters?.type) {
      users = await this.userRepository.findByType(filters.type);
    } else {
      users = await this.userRepository.findAll();
    }

    // Aplicar paginación si se especifica
    if (filters?.offset !== undefined || filters?.limit !== undefined) {
      const offset = filters.offset || 0;
      const limit = filters.limit || users.length;
      users = users.slice(offset, offset + limit);
    }

    // Obtener total
    const total = await this.userRepository.count();

    // Mapear aDTO de respuesta
    const usersData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      users: usersData,
      total,
    };
  }
}