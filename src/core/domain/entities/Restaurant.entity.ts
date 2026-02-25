import { Phone } from '../value-objects/Phone.vo';
import { Url } from '../value-objects/Url.vo';

export class Restaurant {
  constructor(
    public readonly id: number,
    public name: string,
    public schedule: string,
    public phone: Phone,
    public tags: string[],
    public address: string,
    public readonly ownerId: number,
    public readonly applicationId: number,
    public facebook?: Url,
    public instagram?: Url,
    public likesCount: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(data: {
    name: string;
    schedule: string;
    phone: string;
    tags: string[];
    address: string;
    facebook?: string;
    instagram?: string;
    ownerId: number;
    applicationId: number;
  }): Restaurant {
    // Validaciones
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('El nombre del restaurante debe tener al menos 3 caracteres');
    }
    if (!data.schedule || data.schedule.trim().length === 0) {
      throw new Error('El horario es obligatorio');
    }
    if (!data.address || data.address.trim().length < 5) {
      throw new Error('La dirección debe tener al menos 5 caracteres');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del restaurantero es inválido');
    }
    if (!data.applicationId || data.applicationId <= 0) {
      throw new Error('El ID de solicitud es inválido');
    }

    return new Restaurant(
      0,
      data.name.trim(),
      data.schedule.trim(),
      new Phone(data.phone),
      data.tags || [],
      data.address.trim(),
      data.ownerId,
      data.applicationId,
      data.facebook ? new Url(data.facebook) : undefined,
      data.instagram ? new Url(data.instagram) : undefined,
      0,
      new Date(),
      new Date()
    );
  }

  incrementLikes(): void {
    this.likesCount++;
  }

  decrementLikes(): void {
    if (this.likesCount > 0) {
      this.likesCount--;
    }
  }

  updateInfo(data: {
    name?: string;
    schedule?: string;
    phone?: string;
    tags?: string[];
    address?: string;
    facebook?: string;
    instagram?: string;
  }): void {
    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }
      this.name = data.name.trim();
    }
    if (data.schedule) this.schedule = data.schedule.trim();
    if (data.phone) this.phone = new Phone(data.phone);
    if (data.tags) this.tags = data.tags;
    if (data.address) this.address = data.address.trim();
    if (data.facebook) this.facebook = new Url(data.facebook);
    if (data.instagram) this.instagram = new Url(data.instagram);
    
    this.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      schedule: this.schedule,
      phone: this.phone.getValue(),
      tags: this.tags,
      address: this.address,
      facebook: this.facebook?.getValue(),
      instagram: this.instagram?.getValue(),
      ownerId: this.ownerId,
      applicationId: this.applicationId,
      likesCount: this.likesCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}