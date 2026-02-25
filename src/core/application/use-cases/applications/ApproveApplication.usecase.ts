import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface ApproveApplicationDto {
  applicationId: number;
  approvedBy: number; // ID del admin que aprueba
}

/**
 * Caso de uso: Aprobar solicitud de restaurante
 * Solo administradores
 */
export class ApproveApplicationUseCase {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

  async execute(dto: ApproveApplicationDto): Promise<void> {
    const application = await this.applicationRepository.findById(dto.applicationId);
    if (!application) {
      throw NotFoundException.applicationNotFound(dto.applicationId);
    }

    // Validar que esté pendiente o en revisión
    if (!application.isPending() && !application.isInReview()) {
      throw new ValidationException(
        'Solo se pueden aprobar solicitudes pendientes o en revisión'
      );
    }

    // Aprobar
    application.approve();

    await this.applicationRepository.update(application);
  }
}