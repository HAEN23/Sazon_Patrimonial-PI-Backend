import { IDownloadRepository } from '@/core/domain/repositories/IDownloadRepository';
import { DownloadOrigin } from '@/core/domain/enums/DownloadOrigin.enum';
import { OpinionType } from '@/core/domain/enums/OpinionType.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface UpdateDownloadDto {
  downloadId: number;
  origin?: DownloadOrigin;
  opinion?: OpinionType;
}

/**
 * Caso de uso: Actualizar registro de descarga
 */
export class UpdateDownloadUseCase {
  constructor(private readonly downloadRepository: IDownloadRepository) {}

  async execute(dto: UpdateDownloadDto): Promise<void> {
    const download = await this.downloadRepository.findById(dto.downloadId);
    if (!download) {
      throw new NotFoundException('Descarga no encontrada', 'Download', dto.downloadId);
    }

    if (dto.origin) {
      download.updateOrigin(dto.origin);
    }

    if (dto.opinion) {
      download.updateOpinion(dto.opinion);
    }

    await this.downloadRepository.update(download);
  }
}