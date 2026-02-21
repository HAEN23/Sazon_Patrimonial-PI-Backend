import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { User } from '@/core/domain/entities/User.entity';
import { Client } from '@/core/domain/entities/Client.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { Password } from '@/core/domain/value-objects/Password.vo';

export interface CreateClientDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateClientResult {
  userId: number;
  clientId: number;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Caso de uso: Crear un nuevo cliente
 * Similar a ClientRegister pero puede ser usado internamente
 */
export class CreateClientUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: CreateClientDto): Promise<CreateClientResult> {
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

    // 3. Hash de la contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 4. Crear usuario
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      type: UserType.CLIENT,
    });

    user.password = new Password(hashedPassword, true);

    // 5. Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // 6. Crear cliente
    const client = Client.create(savedUser.id, dto.phone);
    const savedClient = await this.clientRepository.save(client);

    return {
      userId: savedUser.id,
      clientId: savedClient.userId,
      name: savedUser.name,
      email: savedUser.email.getValue(),
      phone: savedClient.phone,
    };
  }
}