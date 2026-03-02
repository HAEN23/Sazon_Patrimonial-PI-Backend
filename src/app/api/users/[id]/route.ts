import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { GetUserUseCase } from '@/core/application/use-cases/users/GetUser.usecase';
import { UpdateUserUseCase } from '@/core/application/use-cases/users/UpdateUser.usecase';
import { DeleteUserUseCase } from '@/core/application/use-cases/users/DeleteUser.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';

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
    await adminMiddleware(request);
    const userId = parseInt(params.id);
    const body = await request.json();

    const userRepository = new PrismaUserRepository();
    const useCase = new UpdateUserUseCase(userRepository);

    await useCase.execute(userId, body);

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
    await adminMiddleware(request);
    const userId = parseInt(params.id);

    const userRepository = new PrismaUserRepository();
    const useCase = new DeleteUserUseCase(userRepository);

    await useCase.execute(userId);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  })(request);
}