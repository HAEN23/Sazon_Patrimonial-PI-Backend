import { IImageRepository } from '@/core/domain/repositories/IImageRepository';

export interface GetImagesByRestaurantResult {
  images: Array<{
    id: number;
    imageUrl: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener imágenes de un restaurante
 */
export class GetImagesByRestaurantUseCase {
  constructor(private readonly imageRepository: IImageRepository) {}

  async execute(restaurantId: number): Promise<GetImagesByRestaurantResult> {
    const images = await this.imageRepository.findByRestaurantId(restaurantId);

    const imagesData = images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl.getValue(),
      uploadedAt: img.uploadedAt,
    }));

    return {
      images: imagesData,
      total: images.length,
    };
  }
}