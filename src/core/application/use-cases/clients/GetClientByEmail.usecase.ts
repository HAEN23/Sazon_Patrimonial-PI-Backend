import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface GetClientByEmailResult {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

/**
 * Caso de uso: Obtener un cliente por email
 */
export class GetClientByEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(email: string): Promise<GetClientByEmailResult> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`);
    }

    // 2. Verificar que sea un cliente
    if (user.type !== UserType.CLIENT) {
      throw new NotFoundException(
        `El usuario con email ${email} no es un cliente`
      );
    }

    // 3. Buscar datos de cliente
    const client = await this.clientRepository.findByUserId(user.id);
    if (!client) {
      throw NotFoundException.clientNotFound(user.id);
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email.getValue(),
      phone: client.phone,
      createdAt: user.createdAt,
    };
  }
}