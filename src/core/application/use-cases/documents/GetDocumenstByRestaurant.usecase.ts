import { IDocumentRepository } from '@/core/domain/repositories/IDocumentRepository';

export interface GetDocumentsByRestaurantResult {
  documents: Array<{
    id: number;
    type: string;
    fileUrl: string;
    uploadedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener documentos de un restaurante
 */
export class GetDocumentsByRestaurantUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(restaurantId: number): Promise<GetDocumentsByRestaurantResult> {
    const documents = await this.documentRepository.findByRestaurantId(restaurantId);

    const documentsData = documents.map(doc => ({
      id: doc.id,
      type: doc.type,
      fileUrl: doc.fileUrl.getValue(),
      uploadedAt: doc.uploadedAt,
    }));

    return {
      documents: documentsData,
      total: documents.length,
    };
  }
}