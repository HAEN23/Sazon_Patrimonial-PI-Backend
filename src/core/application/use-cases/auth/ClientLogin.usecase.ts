import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';

export interface ClientLoginDto {
  email: string;
  password: string;
}

export interface ClientLoginResult {
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
}

/**
 * Caso de uso: Login de Cliente
 */
export class ClientLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ClientLoginDto): Promise<ClientLoginResult> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw UnauthorizedException.wrongEmailOrPassword();
    }

    // 2. Validar que sea un cliente
    if (user.type !== UserType.CLIENT) {
      throw UnauthorizedException.wrongUserType('cliente');
    }

    // 3. Validar contraseña
    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.password.getValue()
    );

    if (!isPasswordValid) {
      throw UnauthorizedException.wrongEmailOrPassword();
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