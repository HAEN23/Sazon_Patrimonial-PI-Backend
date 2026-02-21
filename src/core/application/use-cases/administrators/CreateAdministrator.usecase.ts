import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { User } from '@/core/domain/entities/User.entity';
import { Administrator } from '@/core/domain/entities/Administrador.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { Password } from '@/core/domain/value-objects/Password.vo';

export interface CreateAdministratorDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateAdministratorResult {
  userId: number;
  name: string;
  email: string;
  type: string;
}

/**
 * Caso de uso: Crear un nuevo administrador
 * Solo otro administrador puede crear administradores
 */
export class CreateAdministratorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly administratorRepository: IAdministratorRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: CreateAdministratorDto): Promise<CreateAdministratorResult> {
    // 1. Verificar que el email no exista
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw ConflictException.emailAlreadyExists(dto.email);
    }

    // 2. Hash de la contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 3. Crear usuario
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      type: UserType.ADMIN,
    });

    user.password = new Password(hashedPassword, true);

    // 4. Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // 5. Crear administrador
    const admin = Administrator.create(savedUser.id);
    await this.administratorRepository.save(admin);

    return {
      userId: savedUser.id,
      name: savedUser.name,
      email: savedUser.email.getValue(),
      type: savedUser.type,
    };
  }
}