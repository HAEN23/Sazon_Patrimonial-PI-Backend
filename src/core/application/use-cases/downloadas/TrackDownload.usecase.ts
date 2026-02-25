import { IDownloadRepository } from '@/core/domain/repositories/IDownloadRepository';
import { Download } from '@/core/domain/entities/Download.entity';
import { DownloadOrigin } from '@/core/domain/enums/DownloadOrigin.enum';
import { OpinionType } from '@/core/domain/enums/OpinionType.enum';

export interface TrackDownloadDto {
  ownerId: number;
  origin: DownloadOrigin;
  opinion: OpinionType;
}

/**
 * Caso de uso: Registrar una descarga
 */
export class TrackDownloadUseCase {
  constructor(private readonly downloadRepository: IDownloadRepository) {}

  async execute(dto: TrackDownloadDto): Promise<Download> {
    const download = Download.create({
      downloadCount: 1,
      origin: dto.origin,
      opinion: dto.opinion,
      ownerId: dto.ownerId,
    });

    return await this.downloadRepository.save(download);
  }
}