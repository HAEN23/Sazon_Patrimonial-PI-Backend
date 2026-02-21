import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import { User } from '@/core/domain/entities/User.entity';
import { RestaurantOwner } from '@/core/domain/entities/RestaurantOwner.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { Password } from '@/core/domain/value-objects/Password.vo';

export interface CreateRestaurantOwnerDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateRestaurantOwnerResult {
  userId: number;
  name: string;
  email: string;
  type: string;
}

/**
 * Caso de uso: Crear un nuevo restaurantero
 * Solo administradores pueden crear restauranteros
 */
export class CreateRestaurantOwnerUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: CreateRestaurantOwnerDto): Promise<CreateRestaurantOwnerResult> {
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
      type: UserType.RESTAURANT_OWNER,
    });

    user.password = new Password(hashedPassword, true);

    // 4. Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // 5. Crear restaurantero
    const owner = RestaurantOwner.create(savedUser.id);
    await this.restaurantOwnerRepository.save(owner);

    return {
      userId: savedUser.id,
      name: savedUser.name,
      email: savedUser.email.getValue(),
      type: savedUser.type,
    };
  }
}