import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetUserResult {
  id: number;
  name: string;
  email: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caso de uso: Obtener un usuario por ID
 */
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<GetUserResult> {
    // Buscar usuario
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw NotFoundException.userNotFound(userId);
    }

    // Retornar datos del usuario (sin contraseña)
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}