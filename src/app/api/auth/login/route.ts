import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { loginSchema } from '@/core/infrastructure/http/validators/user.validator';
import { LoginUseCase, LoginDto } from '@/core/application/use-cases/auth/Login.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';
import { JwtService } from '@/core/infrastructure/auth/JwtService';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await validateBody<LoginDto>(request, loginSchema);

    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const useCase = new LoginUseCase(userRepository, passwordHasher);
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}