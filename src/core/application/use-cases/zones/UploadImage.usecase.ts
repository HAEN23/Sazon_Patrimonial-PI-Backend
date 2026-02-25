import { IImageRepository } from '@/core/domain/repositories/IImageRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { Image } from '@/core/domain/entities/Image.entity';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UploadImageDto {
  file: File | Buffer;
  filename: string;
  restaurantId: number;
  applicationId: number;
  ownerId: number;
  requesterId: number;
  requesterType: UserType;
}

export interface UploadImageResult {
  imageId: number;
  imageUrl: string;
  uploadedAt: Date;
}

/**
 * Caso de uso: Subir imagen de restaurante
 */
export class UploadImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: UploadImageDto): Promise<UploadImageResult> {
    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(dto.restaurantId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('restaurante');
    }

    // Subir archivo
    const imageUrl = await this.fileStorage.upload(
      dto.file,
      'restaurant-images',
      dto.filename
    );

    // Crear registro
    const image = Image.create({
      imageUrl,
      restaurantId: dto.restaurantId,
      applicationId: dto.applicationId,
      ownerId: dto.ownerId,
    });

    const savedImage = await this.imageRepository.save(image);

    return {
      imageId: savedImage.id,
      imageUrl: savedImage.imageUrl.getValue(),
      uploadedAt: savedImage.uploadedAt,
    };
  }
}