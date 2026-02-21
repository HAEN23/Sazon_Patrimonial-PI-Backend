import { IDocumentRepository } from '@/core/domain/repositories/IDocumentRepository';
import { DocumentType } from '@/core/domain/enums/DocumentType.enum';

export interface GetDocumentsByTypeResult {
  documents: Array<{
    id: number;
    restaurantId: number;
    fileUrl: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener documentos por tipo
 */
export class GetDocumentsByTypeUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(type: DocumentType): Promise<GetDocumentsByTypeResult> {
    const documents = await this.documentRepository.findByType(type);

    const documentsData = documents.map(doc => ({
      id: doc.id,
      restaurantId: doc.restaurantId,
      fileUrl: doc.fileUrl.getValue(),
      uploadedAt: doc.uploadedAt,
    }));

    return {
      documents: documentsData,
      total: documents.length,
    };
  }
}