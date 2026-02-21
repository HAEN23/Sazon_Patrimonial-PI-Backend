import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetUserByEmailResult {
  id: number;
  name: string;
  email: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caso de uso: Obtener un usuario por email
 */
export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<GetUserByEmailResult> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(
        `Usuario con email ${email} no encontrado`,
        'User',
        email
      );
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