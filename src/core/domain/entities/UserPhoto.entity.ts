import { FileUrl } from '../value-objects/FileUrl.vo';

export class UserPhoto {
  constructor(
    public readonly id: number,
    public photoUrl: FileUrl,
    public readonly clientId: number,
    public readonly restaurantId: number,
    public readonly uploadedAt: Date = new Date()
  ) {}

  static create(data: {
    photoUrl: string;
    clientId: number;
    restaurantId: number;
  }): UserPhoto {
    if (!data.clientId || data.clientId <= 0) {
      throw new Error('El ID del cliente es inválido');
    }
    if (!data.restaurantId || data.restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }

    return new UserPhoto(
      0,
      new FileUrl(data.photoUrl),
      data.clientId,
      data.restaurantId,
      new Date()
    );
  }

  toJSON() {
    return {
      id: this.id,
      photoUrl: this.photoUrl.getValue(),
      clientId: this.clientId,
      restaurantId: this.restaurantId,
      uploadedAt: this.uploadedAt,
    };
  }
}