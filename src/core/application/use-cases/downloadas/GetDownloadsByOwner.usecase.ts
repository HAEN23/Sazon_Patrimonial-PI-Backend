import { IDownloadRepository } from '@/core/domain/repositories/IDownloadRepository';

export interface GetDownloadsByOwnerResult {
  downloads: Array<{
    id: number;
    downloadCount: number;
    origin: string;
    opinion: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener descargas de un propietario
 */
export class GetDownloadsByOwnerUseCase {
  constructor(private readonly downloadRepository: IDownloadRepository) {}

  async execute(ownerId: number): Promise<GetDownloadsByOwnerResult> {
    const downloads = await this.downloadRepository.findByOwnerId(ownerId);

    const downloadsData = downloads.map(dl => ({
      id: dl.id,
      downloadCount: dl.downloadCount,
      origin: dl.origin,
      opinion: dl.opinion,
      createdAt: dl.createdAt,
    }));

    return {
      downloads: downloadsData,
      total: downloads.length,
    };
  }
}