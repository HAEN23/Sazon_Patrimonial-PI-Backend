import { IDocumentRepository } from '@/core/domain/repositories/IDocumentRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteDocumentDto {
  documentId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar un documento
 */
export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: DeleteDocumentDto): Promise<void> {
    const document = await this.documentRepository.findById(dto.documentId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado', 'Document', dto.documentId);
    }

    const restaurant = await this.restaurantRepository.findById(document.restaurantId);
    if (!restaurant) {
      throw NotFoundException.restaurantNotFound(document.restaurantId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      restaurant.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('documento');
    }

    // Eliminar archivo
    await this.fileStorage.delete(document.fileUrl.getValue());

    // Eliminar registro
    await this.documentRepository.delete(dto.documentId);
  }
}