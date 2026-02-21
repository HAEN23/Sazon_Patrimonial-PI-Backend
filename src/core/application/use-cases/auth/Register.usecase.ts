import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { User } from '@/core/domain/entities/User.entity';
import { Administrator } from '@/core/domain/entities/Administrador.entity';
import { RestaurantOwner } from '@/core/domain/entities/RestaurantOwner.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { Password } from '@/core/domain/value-objects/Password.vo';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  type: UserType;
}

/**
 * Caso de uso: Registro de Administrador o Restaurantero
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly administratorRepository: IAdministratorRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    // 1. Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw ConflictException.emailAlreadyExists(dto.email);
    }

    // 2. Validar tipo de usuario
    if (dto.type !== UserType.ADMIN && dto.type !== UserType.RESTAURANT_OWNER) {
      throw new ValidationException(
        'Tipo de usuario inválido para este registro. Use el registro de cliente.'
      );
    }

    // 3. Validar nombre
    if (!dto.name || dto.name.trim().length < 3) {
      throw ValidationException.fromSingleError(
        'name',
        'El nombre debe tener al menos 3 caracteres'
      );
    }

    // 4. Hash de la contraseña
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // 5. Crear usuario
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      type: dto.type,
    });

    // Actualizar con el password hasheado
    user.password = new Password(hashedPassword, true);

    // 6. Guardar usuario en la base de datos
    const savedUser = await this.userRepository.save(user);

    // 7. Crear registro específico según el tipo
    if (dto.type === UserType.ADMIN) {
      const admin = Administrator.create(savedUser.id);
      await this.administratorRepository.save(admin);
    } else if (dto.type === UserType.RESTAURANT_OWNER) {
      const owner = RestaurantOwner.create(savedUser.id);
      await this.restaurantOwnerRepository.save(owner);
    }

    return savedUser;
  }
}