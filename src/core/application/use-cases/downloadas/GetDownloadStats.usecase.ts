import { IDownloadRepository } from '@/core/domain/repositories/IDownloadRepository';

export interface DownloadStatsResult {
  total: number;
  national: number;
  foreign: number;
  nationalPercentage: number;
  foreignPercentage: number;
}

/**
 * Caso de uso: Obtener estadísticas de descargas
 */
export class GetDownloadStatsUseCase {
  constructor(private readonly downloadRepository: IDownloadRepository) {}

  async execute(): Promise<DownloadStatsResult> {
    const stats = await this.downloadRepository.getStats();

    const nationalPercentage = stats.total > 0 
      ? (stats.national / stats.total) * 100 
      : 0;
    const foreignPercentage = stats.total > 0 
      ? (stats.foreign / stats.total) * 100 
      : 0;

    return {
      ...stats,
      nationalPercentage: Math.round(nationalPercentage * 100) / 100,
      foreignPercentage: Math.round(foreignPercentage * 100) / 100,
    };
  }
}