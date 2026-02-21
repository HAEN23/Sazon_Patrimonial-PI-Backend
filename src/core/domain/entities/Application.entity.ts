import { ApplicationStatus } from '../enums/ApplicationStatus.enum';
import { Email } from '../value-objects/Email.vo';

export class Application {
  constructor(
    public readonly id: number,
    public proposedRestaurantName: string,
    public ownerName: string,
    public email: Email,
    public schedule: string,
    public status: ApplicationStatus,
    public readonly ownerId: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(data: {
    proposedRestaurantName: string;
    ownerName: string;
    email: string;
    schedule: string;
    ownerId: number;
  }): Application {
    if (!data.proposedRestaurantName || data.proposedRestaurantName.trim().length < 3) {
      throw new Error('El nombre del restaurante debe tener al menos 3 caracteres');
    }
    if (!data.ownerName || data.ownerName.trim().length < 3) {
      throw new Error('El nombre del propietario debe tener al menos 3 caracteres');
    }
    if (!data.schedule || data.schedule.trim().length === 0) {
      throw new Error('El horario es obligatorio');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del propietario es inválido');
    }

    return new Application(
      0,
      data.proposedRestaurantName.trim(),
      data.ownerName.trim(),
      new Email(data.email),
      data.schedule.trim(),
      ApplicationStatus.PENDING,
      data.ownerId,
      new Date(),
      new Date()
    );
  }

  approve(): void {
    if (this.status === ApplicationStatus.APPROVED) {
      throw new Error('La solicitud ya está aprobada');
    }
    this.status = ApplicationStatus.APPROVED;
    this.updatedAt = new Date();
  }

  reject(): void {
    if (this.status === ApplicationStatus.REJECTED) {
      throw new Error('La solicitud ya está rechazada');
    }
    this.status = ApplicationStatus.REJECTED;
    this.updatedAt = new Date();
  }

  setInReview(): void {
    this.status = ApplicationStatus.IN_REVIEW;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === ApplicationStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === ApplicationStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === ApplicationStatus.REJECTED;
  }

  isInReview(): boolean {
    return this.status === ApplicationStatus.IN_REVIEW;
  }

  toJSON() {
    return {
      id: this.id,
      proposedRestaurantName: this.proposedRestaurantName,
      ownerName: this.ownerName,
      email: this.email.getValue(),
      schedule: this.schedule,
      status: this.status,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}