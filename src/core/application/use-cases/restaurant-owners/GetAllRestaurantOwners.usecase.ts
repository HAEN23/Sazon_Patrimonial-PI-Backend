import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export interface GetAllRestaurantOwnersResult {
  owners: Array<{
    userId: number;
    name: string;
    email: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los restauranteros
 * Solo para administradores
 */
export class GetAllRestaurantOwnersUseCase {
  constructor(
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<GetAllRestaurantOwnersResult> {
    // 1. Obtener todos los restauranteros
    const owners = await this.restaurantOwnerRepository.findAll();

    // 2. Obtener información de usuarios
    const ownersData = await Promise.all(
      owners.map(async (owner) => {
        const user = await this.userRepository.findById(owner.userId);
        if (!user) return null;

        return {
          userId: user.id,
          name: user.name,
          email: user.email.getValue(),
          createdAt: owner.createdAt,
        };
      })
    );

    // 3. Filtrar nulos
    const validOwners = ownersData.filter((owner) => owner !== null);

    return {
      owners: validOwners as Array<{
        userId: number;
        name: string;
        email: string;
        createdAt: Date;
      }>,
      total: validOwners.length,
    };
  }
}