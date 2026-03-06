import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetUserUseCase } from '@/core/application/use-cases/users/GetUser.usecase';
import { UpdateUserUseCase } from '@/core/application/use-cases/users/UpdateUser.usecase';
import { DeleteUserUseCase } from '@/core/application/use-cases/users/DeleteUser.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaClientRepository } from '@/core/infrastructure/database/repositories/PrismaClientRepository';
import { PrismaAdministratorRepository } from '@/core/infrastructure/database/repositories/PrismaAdministratorRepository';
import { PrismaRestaurantOwnerRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantOwnerRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { UserType } from '@/core/domain/enums/UserType.enum';

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    await adminMiddleware(request);
    const userId = parseInt(params.id);

    const userRepository = new PrismaUserRepository();
    const useCase = new GetUserUseCase(userRepository);

    const result = await useCase.execute(userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const admin = await adminMiddleware(request);
    const userId = parseInt(params.id);
    const body = await request.json();

    const userRepository = new PrismaUserRepository();
    const clientRepository = new PrismaClientRepository();
    const useCase = new UpdateUserUseCase(userRepository, clientRepository);

    await useCase.execute({
      userId,
      requesterId: admin.userId,
      requesterType: admin.type as UserType,
      ...body,
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    });
  })(request);
}

/**
 * DELETE /api/users/:id
 * Eliminar usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const admin = await adminMiddleware(request);
    const userId = parseInt(params.id);

    const userRepository = new PrismaUserRepository();
    const administratorRepository = new PrismaAdministratorRepository();
    const restaurantOwnerRepository = new PrismaRestaurantOwnerRepository();
    const clientRepository = new PrismaClientRepository();
    const restaurantRepository = new PrismaRestaurantRepository();

    const useCase = new DeleteUserUseCase(
      userRepository,
      administratorRepository,
      restaurantOwnerRepository,
      clientRepository,
      restaurantRepository
    );

    await useCase.execute({
      userId,
      requesterId: admin.userId,
      requesterType: admin.type as UserType,
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  })(request);
}