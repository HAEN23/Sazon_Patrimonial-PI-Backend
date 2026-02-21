import { DownloadOrigin } from '../enums/DownloadOrigin.enum';
import { OpinionType } from '../enums/OpinionType.enum';

export class Download {
  constructor(
    public readonly id: number,
    public downloadCount: number,
    public origin: DownloadOrigin,
    public opinion: OpinionType,
    public readonly ownerId: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(data: {
    downloadCount: number;
    origin: DownloadOrigin;
    opinion: OpinionType;
    ownerId: number;
  }): Download {
    if (data.downloadCount < 0) {
      throw new Error('El contador de descargas no puede ser negativo');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del propietario es inválido');
    }

    return new Download(
      0,
      data.downloadCount,
      data.origin,
      data.opinion,
      data.ownerId,
      new Date(),
      new Date()
    );
  }

  incrementCount(): void {
    this.downloadCount++;
    this.updatedAt = new Date();
  }

  updateOpinion(opinion: OpinionType): void {
    this.opinion = opinion;
    this.updatedAt = new Date();
  }

  updateOrigin(origin: DownloadOrigin): void {
    this.origin = origin;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      downloadCount: this.downloadCount,
      origin: this.origin,
      opinion: this.opinion,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}