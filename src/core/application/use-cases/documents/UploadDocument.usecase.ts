import { IDocumentRepository } from '@/core/domain/repositories/IDocumentRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { Document } from '@/core/domain/entities/Document.entity';
import { DocumentType } from '@/core/domain/enums/DocumentType.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UploadDocumentDto {
  file: File | Buffer;
  filename: string;
  type: DocumentType;
  restaurantId: number;
  applicationId: number;
  ownerId: number;
  requesterId: number;
  requesterType: UserType;
}

export interface UploadDocumentResult {
  documentId: number;
  fileUrl: string;
  type: string;
  uploadedAt: Date;
}

/**
 * Caso de uso: Subir documento
 */
export class UploadDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(dto: UploadDocumentDto): Promise<UploadDocumentResult> {
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
    const fileUrl = await this.fileStorage.upload(
      dto.file,
      'documents',
      dto.filename
    );

    // Crear registro
    const document = Document.create({
      type: dto.type,
      fileUrl,
      restaurantId: dto.restaurantId,
      applicationId: dto.applicationId,
      ownerId: dto.ownerId,
    });

    const savedDocument = await this.documentRepository.save(document);

    return {
      documentId: savedDocument.id,
      fileUrl: savedDocument.fileUrl.getValue(),
      type: savedDocument.type,
      uploadedAt: savedDocument.uploadedAt,
    };
  }
}