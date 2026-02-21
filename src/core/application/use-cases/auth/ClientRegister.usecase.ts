import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { User } from '@/core/domain/entities/User.entity';
import { Client } from '@/core/domain/entities/Client.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { Password } from '@/core/domain/value-objects/Password.vo';
import { PasswordValidationService } from '@/core/domain/services/PasswordHasher.service';

export interface ClientRegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Caso de uso: Registro de Cliente
 */
export class ClientRegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ClientRegisterDto): Promise<User> {
    // 1. Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw ConflictException.emailAlreadyExists(dto.email);
    }

    // 2. Validar nombre
    if (!dto.name || dto.name.trim().length < 3) {
      throw ValidationException.fromSingleError(
        'name',
        'El nombre debe tener al menos 3 caracteres'
      );
    }

    // 3. Validar fortaleza de contraseña
    const passwordValidation = PasswordValidationService.validateStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new ValidationException(
        'Contraseña débil',
        passwordValidation.errors.map(error => ({
          field: 'password',
          message: error,
        }))
      );
    }

    // 4. Validar teléfono (si se proporciona)
    if (dto.phone) {
      const cleanedPhone = dto.phone.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleanedPhone)) {
        throw ValidationException.fromSingleError(
          'phone',
          'El teléfono debe tener 10 dígitos'
        );
      }
    }

    // 5. Hash de la contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 6. Crear usuario
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      type: UserType.CLIENT,
    });

    // Actualizar con el password hasheado
    user.password = new Password(hashedPassword, true);

    // 7. Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // 8. Crear registro de cliente
    const client = Client.create(savedUser.id, dto.phone);
    await this.clientRepository.save(client);

    return savedUser;
  }
}