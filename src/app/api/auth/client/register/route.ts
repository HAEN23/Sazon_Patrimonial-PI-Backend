import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { clientRegisterSchema } from '@/core/infrastructure/http/validators/client.validator';
import { ClientRegisterUseCase } from '@/core/application/use-cases/auth/ClientRegister.usecase';
import { ClientRegisterDto } from '@/core/application/use-cases/auth/ClientRegister.usecase';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaClientRepository } from '@/core/infrastructure/database/repositories/PrismaClientRepository';
import { BcryptPasswordHasher } from '@/core/infrastructure/auth/BcryptPasswordHasher';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await validateBody<ClientRegisterDto>(request, clientRegisterSchema);

    const userRepository = new PrismaUserRepository();
    const clientRepository = new PrismaClientRepository();
    const passwordHasher = new BcryptPasswordHasher();

    const useCase = new ClientRegisterUseCase(
      userRepository,
      clientRepository,
      passwordHasher
    );

    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  })(request);
}