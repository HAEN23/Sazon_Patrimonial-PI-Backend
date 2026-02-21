import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { RestaurantOwner } from '@/core/domain/entities/RestaurantOwner.entity';
import { UserType } from '@/core/domain/enums/UserType.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface PromoteUserToOwnerDto {
  userId: number;
}

/**
 * Caso de uso: Promover un usuario existente a restaurantero
 * Solo administradores pueden hacer esto
 */
export class PromoteUserToOwnerUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository
  ) {}

  async execute(dto: PromoteUserToOwnerDto): Promise<void> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 2. Verificar que no sea ya un restaurantero
    if (user.type === UserType.RESTAURANT_OWNER) {
      throw new ConflictException(
        'Este usuario ya es restaurantero',
        'ALREADY_OWNER'
      );
    }

    // 3. Verificar que no sea un cliente
    if (user.type === UserType.CLIENT) {
      throw new ValidationException(
        'No se puede promover a un cliente a restaurantero directamente'
      );
    }

    // 4. Actualizar tipo de usuario
    const updatedUser = new (user.constructor as any)(
      user.id,
      user.name,
      user.email,
      user.password,
      UserType.RESTAURANT_OWNER,
      user.createdAt,
      user.updatedAt
    );

    await this.userRepository.update(updatedUser);

    // 5. Crear registro de restaurantero
    const owner = RestaurantOwner.create(dto.userId);
    await this.restaurantOwnerRepository.save(owner);
  }
}