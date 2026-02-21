import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UpdateUserDto {
  userId: number;
  requesterId: number; // ID del usuario que hace la petición
  requesterType: UserType; // Tipo del usuario que hace la petición
  name?: string;
  email?: string;
  phone?: string; // Solo para clientes
}

/**
 * Caso de uso: Actualizar información de usuario
 * El usuario solo puede actualizar su propia información, a menos que sea admin
 */
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(dto: UpdateUserDto): Promise<void> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 2. Verificar permisos (solo admin o el mismo usuario)
    if (dto.requesterId !== dto.userId && dto.requesterType !== UserType.ADMIN) {
      throw ForbiddenException.notYourResource('usuario');
    }

    // 3. Validar y actualizar nombre
    if (dto.name !== undefined) {
      if (!dto.name || dto.name.trim().length < 3) {
        throw ValidationException.fromSingleError(
          'name',
          'El nombre debe tener al menos 3 caracteres'
        );
      }
      user.updateName(dto.name);
    }

    // 4. Validar y actualizar email
    if (dto.email !== undefined) {
      // Verificar que el nuevo email no esté en uso
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== dto.userId) {
        throw ConflictException.emailAlreadyExists(dto.email);
      }
      user.updateEmail(dto.email);
    }

    // 5. Actualizar teléfono (solo para clientes)
    if (dto.phone !== undefined && user.type === UserType.CLIENT) {
      const client = await this.clientRepository.findByUserId(user.id);
      if (client) {
        client.updatePhone(dto.phone);
        await this.clientRepository.update(client);
      }
    }

    // 6. Guardar cambios
    await this.userRepository.update(user);
  }
}