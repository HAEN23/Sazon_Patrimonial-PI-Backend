import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { Application } from '@/core/domain/entities/Application.entity';
import { ApplicationStatus } from '@/core/domain/enums/ApplicationStatus.enum';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';

export interface CreateApplicationDto {
  proposedRestaurantName: string;
  ownerName: string;
  email: string;
  schedule: string;
  ownerId: number;
}

export interface CreateApplicationResult {
  applicationId: number;
  status: string;
  createdAt: Date;
}

/**
 * Caso de uso: Crear solicitud de registro de restaurante
 */
export class CreateApplicationUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository
  ) {}

  async execute(dto: CreateApplicationDto): Promise<CreateApplicationResult> {
    // 1. Verificar que el propietario existe
    const owner = await this.restaurantOwnerRepository.findByUserId(dto.ownerId);
    if (!owner) {
      throw new NotFoundException('Restaurantero no encontrado');
    }

    // 2. Verificar que no tenga solicitudes pendientes
    const pendingApplications = await this.applicationRepository.findByStatus(
      ApplicationStatus.PENDING
    );
    const hasPending = pendingApplications.some(app => app.ownerId === dto.ownerId);
    
    if (hasPending) {
      throw ConflictException.applicationAlreadyExists();
    }

    // 3. Crear solicitud
    const application = Application.create(dto);

    const savedApplication = await this.applicationRepository.save(application);

    return {
      applicationId: savedApplication.id,
      status: savedApplication.status,
      createdAt: savedApplication.createdAt,
    };
  }
}