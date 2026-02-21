import { FileUrl } from '../value-objects/FileUrl.vo';

export class Image {
  constructor(
    public readonly id: number,
    public imageUrl: FileUrl,
    public readonly restaurantId: number,
    public readonly applicationId: number,
    public readonly ownerId: number,
    public readonly uploadedAt: Date = new Date()
  ) {}

  static create(data: {
    imageUrl: string;
    restaurantId: number;
    applicationId: number;
    ownerId: number;
  }): Image {
    if (!data.restaurantId || data.restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }
    if (!data.applicationId || data.applicationId <= 0) {
      throw new Error('El ID de solicitud es inválido');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del propietario es inválido');
    }

    return new Image(
      0,
      new FileUrl(data.imageUrl),
      data.restaurantId,
      data.applicationId,
      data.ownerId,
      new Date()
    );
  }

  toJSON() {
    return {
      id: this.id,
      imageUrl: this.imageUrl.getValue(),
      restaurantId: this.restaurantId,
      applicationId: this.applicationId,
      ownerId: this.ownerId,
      uploadedAt: this.uploadedAt,
    };
  }
}