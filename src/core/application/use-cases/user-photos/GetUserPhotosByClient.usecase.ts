import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetUserPhotosByClientResult {
  photos: Array<{
    id: number;
    photoUrl: string;
    restaurantId: number;
    restaurantName: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todas las fotos de un cliente
 */
export class GetUserPhotosByClientUseCase {
  constructor(
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(clientId: number): Promise<GetUserPhotosByClientResult> {
    const photos = await this.userPhotoRepository.findByClientId(clientId);

    const photosData = await Promise.all(
      photos.map(async (photo) => {
        const restaurant = await this.restaurantRepository.findById(photo.restaurantId);
        
        return {
          id: photo.id,
          photoUrl: photo.photoUrl.getValue(),
          restaurantId: photo.restaurantId,
          restaurantName: restaurant?.name || 'Restaurante',
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