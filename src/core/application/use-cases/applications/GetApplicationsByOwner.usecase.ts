import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';

export interface GetApplicationsByOwnerResult {
  applications: Array<{
    id: number;
    proposedRestaurantName: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener solicitudes de un propietario
 */
export class GetApplicationsByOwnerUseCase {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

  async execute(ownerId: number): Promise<GetApplicationsByOwnerResult> {
    const applications = await this.applicationRepository.findByOwnerId(ownerId);

    const applicationsData = applications.map(app => ({
      id: app.id,
      proposedRestaurantName: app.proposedRestaurantName,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return {
      applications: applicationsData,
      total: applications.length,
    };
  }
}