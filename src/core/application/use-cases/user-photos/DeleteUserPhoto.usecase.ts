import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteUserPhotoDto {
  photoId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar una foto de usuario
 * Solo el cliente que subió la foto o un admin pueden eliminarla
 */
export class DeleteUserPhotoUseCase {
  constructor(
    private readonly userPhotoRepository: IUserPhotoRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: DeleteUserPhotoDto): Promise<void> {
    const photo = await this.userPhotoRepository.findById(dto.photoId);
    if (!photo) {
      throw NotFoundException.photoNotFound(dto.photoId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      photo.clientId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('foto');
    }

    // Eliminar archivo
    await this.fileStorage.delete(photo.photoUrl.getValue());

    // Eliminar registro
    await this.userPhotoRepository.delete(dto.photoId);
  }
}