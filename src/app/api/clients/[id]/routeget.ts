import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { GetClientUseCase } from '@/core/application/use-cases/clients/GetClient.usecase';
import { PrismaClientRepository } from '@/core/infrastructure/database/repositories/PrismaClientRepository';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';

/**
 * GET /api/clients/:id
 * Obtener perfil del cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const authenticatedClient = await clientAuthMiddleware(request);
    const clientId = parseInt(params.id);

    // Verificar que el cliente solo pueda ver su propio perfil
    if (authenticatedClient.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para ver este perfil' },
        { status: 403 }
      );
    }

    const clientRepository = new PrismaClientRepository();
    const userRepository = new PrismaUserRepository();

    const useCase = new GetClientUseCase(userRepository, clientRepository);
    const result = await useCase.execute(clientId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  })(request);
}