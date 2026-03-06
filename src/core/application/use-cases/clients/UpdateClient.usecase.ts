import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface UpdateClientDto {
  userId: number;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Caso de uso: Actualizar información de un cliente
 */
export class UpdateClientUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(dto: UpdateClientDto): Promise<void> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 2. Verificar que el cliente existe
    const client = await this.clientRepository.findByUserId(dto.userId);
    if (!client) {
      throw NotFoundException.clientNotFound(dto.userId);
    }

    // 3. Actualizar nombre si se proporciona
    if (dto.name !== undefined) {
      if (!dto.name || dto.name.trim().length < 3) {
        throw ValidationException.fromSingleError(
          'name',
          'El nombre debe tener al menos 3 caracteres'
        );
      }
      user.updateName(dto.name);
    }

    // 4. Actualizar email si se proporciona
    if (dto.email !== undefined) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== dto.userId) {
        throw ConflictException.emailAlreadyExists(dto.email);
      }
      user.updateEmail(dto.email);
    }

    // 5. Actualizar teléfono si se proporciona
    if (dto.phone !== undefined) {
      client.updatePhone(dto.phone);
      await this.clientRepository.update(client);
    }

    // 6. Guardar cambios del usuario
    await this.userRepository.update(user);
  }
}