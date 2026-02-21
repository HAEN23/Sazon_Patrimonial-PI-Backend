import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteUserDto {
  userId: number;
  requesterId: number; // ID del usuario que hace la petición
  requesterType: UserType; // Tipo del usuario que hace la petición
}

/**
 * Caso de uso: Eliminar un usuario
 * Solo administradores pueden eliminar usuarios
 * No se puede eliminar a sí mismo
 */
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly administratorRepository: IAdministratorRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository,
    private readonly clientRepository: IClientRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(dto: DeleteUserDto): Promise<void> {
    // 1. Solo administradores pueden eliminar usuarios
    if (dto.requesterType !== UserType.ADMIN) {
      throw ForbiddenException.insufficientRole('administrador');
    }

    // 2. No se puede eliminar a sí mismo
    if (dto.userId === dto.requesterId) {
      throw new ForbiddenException(
        'No puedes eliminar tu propia cuenta',
        undefined,
        'CANNOT_DELETE_SELF'
      );
    }

    // 3. Verificar que el usuario existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw NotFoundException.userNotFound(dto.userId);
    }

    // 4. Verificar si el usuario tiene recursos asociados
    if (user.type === UserType.RESTAURANT_OWNER) {
      const restaurants = await this.restaurantRepository.findByOwnerId(dto.userId);
      if (restaurants.length > 0) {
        throw ConflictException.resourceInUse(
          'No se puede eliminar el restaurantero porque tiene restaurantes registrados'
        );
      }
    }

    // 5. Eliminar registros específicos según el tipo
    switch (user.type) {
      case UserType.ADMIN:
        await this.administratorRepository.delete(dto.userId);
        break;

      case UserType.RESTAURANT_OWNER:
        await this.restaurantOwnerRepository.delete(dto.userId);
        break;

      case UserType.CLIENT:
        await this.clientRepository.delete(dto.userId);
        break;
    }

    // 6. Eliminar usuario
    const deleted = await this.userRepository.delete(dto.userId);

    if (!deleted) {
      throw new Error('No se pudo eliminar el usuario');
    }
  }
}