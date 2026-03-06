import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { updateClientSchema } from '@/core/infrastructure/http/validators/client.validator';
import { UpdateClientUseCase, UpdateClientDto } from '@/core/application/use-cases/clients/UpdateClient.usecase';
import { PrismaClientRepository } from '@/core/infrastructure/database/repositories/PrismaClientRepository';
import { PrismaUserRepository } from '@/core/infrastructure/database/repositories/PrismaUserRepository';

/**
 * PUT /api/clients/:id
 * Actualizar perfil del cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const authenticatedClient = await clientAuthMiddleware(request);
    const clientId = parseInt(params.id);

    // Verificar que el cliente solo pueda editar su propio perfil
    if (authenticatedClient.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para editar este perfil' },
        { status: 403 }
      );
    }

    const body = await validateBody<Omit<UpdateClientDto, 'userId'>>(request, updateClientSchema);

    const clientRepository = new PrismaClientRepository();
    const userRepository = new PrismaUserRepository();

    const useCase = new UpdateClientUseCase(userRepository, clientRepository);
    
    await useCase.execute({
      userId: clientId,
      ...body,
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
    });
  })(request);
}