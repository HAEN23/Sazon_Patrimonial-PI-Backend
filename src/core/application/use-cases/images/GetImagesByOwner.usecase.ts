import { IImageRepository } from '@/core/domain/repositories/IImageRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';

export interface GetImagesByOwnerResult {
  images: Array<{
    id: number;
    imageUrl: string;
    restaurantId: number;
    restaurantName: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todas las imágenes de un propietario
 */
export class GetImagesByOwnerUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(ownerId: number): Promise<GetImagesByOwnerResult> {
    const images = await this.imageRepository.findByOwnerId(ownerId);

    const imagesData = await Promise.all(
      images.map(async (img) => {
        const restaurant = await this.restaurantRepository.findById(img.restaurantId);
        
        return {
          id: img.id,
          imageUrl: img.imageUrl.getValue(),
          restaurantId: img.restaurantId,
          restaurantName: restaurant?.name || 'Desconocido',
          uploadedAt: img.uploadedAt,
        };
      })
    );

    return {
      images: imagesData,
      total: imagesData.length,
    };
  }
}