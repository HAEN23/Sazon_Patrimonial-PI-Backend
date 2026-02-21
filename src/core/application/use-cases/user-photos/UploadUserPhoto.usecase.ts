import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { UserPhoto } from '@/core/domain/entities/UserPhoto.entity';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface UploadUserPhotoDto {
  clientId: number;
  restaurantId: number;
  file: File | Buffer;
  filename: string;
}

export interface UploadUserPhotoResult {
  photoId: number;
  photoUrl: string;
  restaurantId: number;
  uploadedAt: Date;
}

/**
 * Caso de uso: Subir foto de evidencia de visita
 * El cliente debe tener el restaurante en favoritos
 */
export class UploadUserPhotoUseCase {
  constructor(
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: UploadUserPhotoDto): Promise<UploadUserPhotoResult> {
    // 1. Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(dto.restaurantId);
    }

    // 2. Verificar que el cliente tiene el restaurante en favoritos
    const hasFavorite = await this.favoriteRepository.findByClientAndRestaurant(
      dto.clientId,
      dto.restaurantId
    );

    if (!hasFavorite) {
      throw ForbiddenException.favoriteRequiredForPhoto();
    }

    // 3. Subir archivo
    const photoUrl = await this.fileStorage.upload(
      dto.file,
      'user-photos',
      dto.filename
    );

    // 4. Crear registro de foto
    const userPhoto = UserPhoto.create({
      photoUrl,
      clientId: dto.clientId,
      restaurantId: dto.restaurantId,
    });

    const savedPhoto = await this.userPhotoRepository.save(userPhoto);

    return {
      photoId: savedPhoto.id,
      photoUrl: savedPhoto.photoUrl.getValue(),
      restaurantId: savedPhoto.restaurantId,
      uploadedAt: savedPhoto.uploadedAt,
    };
  }
}