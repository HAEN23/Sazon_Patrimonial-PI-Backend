import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { createUserSchema } from '@/core/infrastructure/http/validators/user.validator';
import { RegisterUseCase } from '@/core/application/use-cases/auth/Register.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaAdministratorRepository } from '@/core/infrastructure/database/repositories/PrismaAdministratorRepository';
import { PrismaRestaurantOwnerRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantOwnerRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await validateBody(request, createUserSchema);

    const userRepository = new PrismaUserRepository();
    const adminRepository = new PrismaAdministratorRepository();
    const ownerRepository = new PrismaRestaurantOwnerRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const useCase = new RegisterUseCase(
      userRepository,
      adminRepository,
      ownerRepository,
      passwordHasher
    );

    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  })(request);
}