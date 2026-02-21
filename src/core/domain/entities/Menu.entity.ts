import { MenuStatus } from '../enums/MenuStatus.enum';
import { FileUrl } from '../value-objects/FileUrl.vo';

export class Menu {
  constructor(
    public readonly id: number,
    public fileUrl: FileUrl,
    public menuUrl: FileUrl,
    public status: MenuStatus,
    public readonly restaurantId: number,
    public downloadCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(data: {
    fileUrl: string;
    menuUrl: string;
    status: MenuStatus;
    restaurantId: number;
  }): Menu {
    if (!data.restaurantId || data.restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }

    return new Menu(
      0,
      new FileUrl(data.fileUrl),
      new FileUrl(data.menuUrl),
      data.status,
      data.restaurantId,
      0,
      new Date(),
      new Date()
    );
  }

  activate(): void {
    this.status = MenuStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = MenuStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  setToPending(): void {
    this.status = MenuStatus.PENDING;
    this.updatedAt = new Date();
  }

  setToRevision(): void {
    this.status = MenuStatus.REVISION;
    this.updatedAt = new Date();
  }

  incrementDownloadCount(): void {
    this.downloadCount++;
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === MenuStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === MenuStatus.INACTIVE;
  }

  isPending(): boolean {
    return this.status === MenuStatus.PENDING;
  }

  toJSON() {
    return {
      id: this.id,
      fileUrl: this.fileUrl.getValue(),
      menuUrl: this.menuUrl.getValue(),
      status: this.status,
      restaurantId: this.restaurantId,
      downloadCount: this.downloadCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}