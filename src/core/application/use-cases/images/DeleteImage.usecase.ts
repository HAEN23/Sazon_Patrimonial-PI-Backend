import { IImageRepository } from '@/core/domain/repositories/IImageRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteImageDto {
  imageId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar una imagen
 */
export class DeleteImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: DeleteImageDto): Promise<void> {
    const image = await this.imageRepository.findById(dto.imageId);
    if (!image) {
      throw new NotFoundException('Imagen no encontrada', 'Image', dto.imageId);
    }

    const restaurant = await this.restaurantRepository.findById(image.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(image.restaurantId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('imagen');
    }

    // Eliminar archivo
    await this.fileStorage.delete(image.imageUrl.getValue());

    // Eliminar registro
    await this.imageRepository.delete(dto.imageId);
  }
}