import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { Application } from '@/core/domain/entities/Application.entity';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';

export interface RegisterRestaurantDto {
  // Datos de la solicitud
  proposedRestaurantName: string;
  ownerName: string;
  email: string;
  schedule: string;
  ownerId: number;
  
  // Datos del restaurante (para cuando se apruebe)
  phone: string;
  tags: string[];
  address: string;
  facebook?: string;
  instagram?: string;
}

export interface RegisterRestaurantResult {
  applicationId: number;
  status: string;
  message: string;
}

/**
 * Caso de uso: Proceso completo de registro de restaurante
 * 1. Crear solicitud
 * 2. Esperar aprobación de admin
 * 3. Crear restaurante cuando se apruebe (en otro use case)
 */
export class RegisterRestaurantUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly restaurantOwnerRepository: IRestaurantOwnerRepository
  ) {}

  async execute(dto: RegisterRestaurantDto): Promise<RegisterRestaurantResult> {
    // 1. Verificar que el propietario existe
    const owner = await this.restaurantOwnerRepository.findByUserId(dto.ownerId);
    if (!owner) {
      throw new NotFoundException('Restaurantero no encontrado');
    }

    // 2. Verificar que no tenga solicitudes pendientes
    const pendingApplications = await this.applicationRepository.findByOwnerId(dto.ownerId);
    const hasPending = pendingApplications.some(app => app.isPending() || app.isInReview());
    
    if (hasPending) {
      throw ConflictException.applicationAlreadyExists();
    }

    // 3. Validar datos básicos
    if (!dto.proposedRestaurantName || dto.proposedRestaurantName.trim().length < 3) {
      throw new ValidationException('El nombre del restaurante debe tener al menos 3 caracteres');
    }

    // 4. Crear solicitud (NO el restaurante todavía)
    const application = Application.create({
      proposedRestaurantName: dto.proposedRestaurantName,
      ownerName: dto.ownerName,
      email: dto.email,
      schedule: dto.schedule,
      ownerId: dto.ownerId,
    });

    const savedApplication = await this.applicationRepository.save(application);

    return {
      applicationId: savedApplication.id,
      status: savedApplication.status,
      message: 'Solicitud creada exitosamente. Espera la aprobación del administrador.',
    };
  }
}