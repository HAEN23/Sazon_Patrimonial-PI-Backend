import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
}

/**
 * Caso de uso: Login de Administrador o Restaurantero
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw UnauthorizedException.invalidCredentials();
    }

    // 2. Validar tipo de usuario (no puede ser cliente)
    if (user.type === UserType.CLIENT) {
      throw UnauthorizedException.wrongUserType('administrador o restaurantero');
    }

    // 3. Validar contraseña
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password.getValue()
    );

    if (!isPasswordValid) {
      throw UnauthorizedException.invalidCredentials();
    }

    // 4. Retornar resultado
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        type: user.type,
      },
    };
  }
}