import { DocumentType } from '../enums/DocumentType.enum';
import { FileUrl } from '../value-objects/FileUrl.vo';

export class Document {
  constructor(
    public readonly id: number,
    public type: DocumentType,
    public fileUrl: FileUrl,
    public readonly restaurantId: number,
    public readonly applicationId: number,
    public readonly ownerId: number,
    public readonly uploadedAt: Date = new Date()
  ) {}

  static create(data: {
    type: DocumentType;
    fileUrl: string;
    restaurantId: number;
    applicationId: number;
    ownerId: number;
  }): Document {
    if (!data.restaurantId || data.restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }
    if (!data.applicationId || data.applicationId <= 0) {
      throw new Error('El ID de solicitud es inválido');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del propietario es inválido');
    }

    return new Document(
      0,
      data.type,
      new FileUrl(data.fileUrl),
      data.restaurantId,
      data.applicationId,
      data.ownerId,
      new Date()
    );
  }

  updateType(newType: DocumentType): void {
    this.type = newType;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      fileUrl: this.fileUrl.getValue(),
      restaurantId: this.restaurantId,
      applicationId: this.applicationId,
      ownerId: this.ownerId,
      uploadedAt: this.uploadedAt,
    };
  }
}