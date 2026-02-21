import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { Password } from '@/core/domain/value-objects/Password.vo';
import { PasswordValidationService } from '@/core/domain/services/PasswordHasher.service';

export interface ChangePasswordDto {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

/**
 * Caso de uso: Cambiar contraseña de usuario
 */
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ChangePasswordDto): Promise<void> {
    // 1. Buscar usuario
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 2. Validar contraseña actual
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      dto.currentPassword,
      user.password.getValue()
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException(
        'La contraseña actual es incorrecta',
        'WRONG_CURRENT_PASSWORD'
      );
    }

    // 3. Validar que la nueva contraseña sea diferente
    const isSamePassword = await this.passwordHasher.compare(
      dto.newPassword,
      user.password.getValue()
    );

    if (isSamePassword) {
      throw new ValidationException(
        'La nueva contraseña debe ser diferente a la actual'
      );
    }

    // 4. Validar fortaleza de la nueva contraseña
    const passwordValidation = PasswordValidationService.validateStrength(dto.newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationException(
        'La nueva contraseña no cumple con los requisitos de seguridad',
        passwordValidation.errors.map(error => ({
          field: 'newPassword',
          message: error,
        }))
      );
    }

    // 5. Hash de la nueva contraseña
    const hashedNewPassword = await this.passwordHasher.hash(dto.newPassword);

    // 6. Actualizar contraseña
    user.password = new Password(hashedNewPassword, true);
    await this.userRepository.update(user);
  }
}