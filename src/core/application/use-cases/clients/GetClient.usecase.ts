import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface GetClientResult {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Caso de uso: Obtener información de un cliente
 */
export class GetClientUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(userId: number): Promise<GetClientResult> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw NotFoundException.userNotFound(userId);
    }

    // 2. Buscar datos de cliente
    const client = await this.clientRepository.findByUserId(userId);
    if (!client) {
      throw NotFoundException.clientNotFound(userId);
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email.getValue(),
      phone: client.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}