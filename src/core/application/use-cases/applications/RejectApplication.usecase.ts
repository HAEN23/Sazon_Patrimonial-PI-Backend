import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface RejectApplicationDto {
  applicationId: number;
  rejectedBy: number; // ID del admin que rechaza
  reason?: string; // Razón del rechazo (opcional)
}

/**
 * Caso de uso: Rechazar solicitud de restaurante
 * Solo administradores
 */
export class RejectApplicationUseCase {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

  async execute(dto: RejectApplicationDto): Promise<void> {
    const application = await this.applicationRepository.findById(dto.applicationId);
    if (!application) {
      throw NotFoundException.applicationNotFound(dto.applicationId);
    }

    // Validar que esté pendiente o en revisión
    if (!application.isPending() && !application.isInReview()) {
      throw new ValidationException(
        'Solo se pueden rechazar solicitudes pendientes o en revisión'
      );
    }

    // Rechazar
    application.reject();

    await this.applicationRepository.update(application);

    // TODO: Enviar notificación al propietario con la razón
  }
}