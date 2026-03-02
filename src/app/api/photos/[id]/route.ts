import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { DeleteUserPhotoUseCase } from '@/core/application/use-cases/user-photos/DeleteUserPhoto.usecase';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { CloudinaryStorage } from '@/core/infrastructure/storage/CloudinaryStorage';

/**
 * DELETE /api/photos/:id
 * Eliminar foto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    const photoId = parseInt(params.id);

    const userPhotoRepository = new PrismaUserPhotoRepository();
    const fileStorage = new CloudinaryStorage();

    const useCase = new DeleteUserPhotoUseCase(userPhotoRepository, fileStorage);

    await useCase.execute({
      photoId,
      requesterId: client.clientId,
      requesterType: client.type,
    });

    return NextResponse.json({
      success: true,
      message: 'Foto eliminada exitosamente',
    });
  })(request);
}