import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { Administrator } from '@/core/domain/entities/Administrador.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface PromoteUserToAdminDto {
  userId: number;
}

/**
 * Caso de uso: Promover un usuario existente a administrador
 * Solo otro administrador puede hacer esto
 */
export class PromoteUserToAdminUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly administratorRepository: IAdministratorRepository
  ) {}

  async execute(dto: PromoteUserToAdminDto): Promise<void> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 2. Verificar que no sea ya un administrador
    if (user.type === UserType.ADMIN) {
      throw new ConflictException(
        'Este usuario ya es administrador',
        'ALREADY_ADMIN'
      );
    }

    // 3. Verificar que no sea un cliente (por política de negocio)
    if (user.type === UserType.CLIENT) {
      throw new ValidationException(
        'No se puede promover a un cliente a administrador directamente'
      );
    }

    // 4. Actualizar tipo de usuario
    const updatedUser = new (user.constructor as any)(
      user.id,
      user.name,
      user.email,
      user.password,
      UserType.ADMIN,
      user.createdAt,
      user.updatedAt
    );

    await this.userRepository.update(updatedUser);

    // 5. Crear registro de administrador
    const admin = Administrator.create(dto.userId);
    await this.administratorRepository.save(admin);
  }
}