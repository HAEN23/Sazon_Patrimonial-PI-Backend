import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { UploadUserPhotoUseCase } from '@/core/application/use-cases/user-photos/UploadUserPhoto.usecase';
import { PrismaUserPhotoRepository } from '@/core/infrastructure/database/repositories/PrismaUserPhotoRepository';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { CloudinaryStorage } from '@/core/infrastructure/storage/CloudinaryStorage';

/**
 * POST /api/photos
 * Subir foto de usuario (requiere like)
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = parseInt(formData.get('restaurantId') as string);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    const userPhotoRepository = new PrismaUserPhotoRepository();
    const favoriteRepository = new PrismaFavoriteRepository();
    const restaurantRepository = new PrismaRestaurantRepository();
    const fileStorage = new CloudinaryStorage();

    const useCase = new UploadUserPhotoUseCase(
      userPhotoRepository,
      favoriteRepository,
      restaurantRepository,
      fileStorage
    );

    const result = await useCase.execute({
      clientId: client.clientId,
      restaurantId,
      file,
      filename: file.name,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Foto subida exitosamente',
    }, { status: 201 });
  })(request);
}