import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { adminMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { createUserSchema } from '@/core/infrastructure/http/validators/user.validator';
import { GetAllUsersUseCase } from '@/core/application/use-cases/users/GetAllUsers.usecase';
import { CreateUserUseCase } from '@/core/application/use-cases/users/CreateUser.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';

/**
 * GET /api/users
 * Obtener todos los usuarios (solo admin)
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await adminMiddleware(request);

    const userRepository = new PrismaUserRepository();
    const useCase = new GetAllUsersUseCase(userRepository);

    const result = await useCase.execute();

    return NextResponse.json({
      success: true,
      data: result.users,
      total: result.total,
    });
  })(request);
}

/**
 * POST /api/users
 * Crear usuario (solo admin)
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    await adminMiddleware(request);
    const body = await validateBody(request, createUserSchema);

    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const useCase = new CreateUserUseCase(userRepository, passwordHasher);
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Usuario creado exitosamente',
    }, { status: 201 });
  })(request);
}