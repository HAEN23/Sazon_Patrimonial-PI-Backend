import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export interface GetAllAdministratorsResult {
  administrators: Array<{
    userId: number;
    name: string;
    email: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todos los administradores
 * Solo para administradores
 */
export class GetAllAdministratorsUseCase {
  constructor(
    private readonly administratorRepository: IAdministratorRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<GetAllAdministratorsResult> {
    // 1. Obtener todos los administradores
    const administrators = await this.administratorRepository.findAll();

    // 2. Obtener información de usuarios
    const administratorsData = await Promise.all(
      administrators.map(async (admin) => {
        const user = await this.userRepository.findById(admin.userId);
        if (!user) return null;

        return {
          userId: user.id,
          name: user.name,
          email: user.email.getValue(),
          createdAt: admin.createdAt,
        };
      })
    );

    // 3. Filtrar nulos (por si acaso)
    const validAdmins = administratorsData.filter((admin) => admin !== null);

    return {
      administrators: validAdmins as Array<{
        userId: number;
        name: string;
        email: string;
        createdAt: Date;
      }>,
      total: validAdmins.length,
    };
  }
}