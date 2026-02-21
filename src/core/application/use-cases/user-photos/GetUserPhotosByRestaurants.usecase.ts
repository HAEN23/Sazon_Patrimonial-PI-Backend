import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export interface GetUserPhotosByRestaurantResult {
  photos: Array<{
    id: number;
    photoUrl: string;
    clientId: number;
    clientName: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todas las fotos de un restaurante
 */
export class GetUserPhotosByRestaurantUseCase {
  constructor(
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(restaurantId: number): Promise<GetUserPhotosByRestaurantResult> {
    const photos = await this.userPhotoRepository.findByRestaurantId(restaurantId);

    const photosData = await Promise.all(
      photos.map(async (photo) => {
        const user = await this.userRepository.findById(photo.clientId);
        
        return {
          id: photo.id,
          photoUrl: photo.photoUrl.getValue(),
          clientId: photo.clientId,
          clientName: user?.name || 'Usuario',
          uploadedAt: photo.uploadedAt,
        };
      })
    );

    return {
      photos: photosData,
      total: photosData.length,
    };
  }
}