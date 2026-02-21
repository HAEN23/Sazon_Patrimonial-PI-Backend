import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface UpdateZoneDto {
  zoneId: number;
  requesterId: number;
  requesterType: UserType;
  name: string;
}

/**
 * Caso de uso: Actualizar una zona
 */
export class UpdateZoneUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(dto: UpdateZoneDto): Promise<void> {
    const zone = await this.zoneRepository.findById(dto.zoneId);
    if (!zone) {
      throw NotFoundException.zoneNotFound(dto.zoneId);
    }

    // Verificar permisos
    if (
      dto.requesterType !== UserType.ADMIN &&
      zone.ownerId !== dto.requesterId
    ) {
      throw ForbiddenException.notYourResource('zona');
    }

    // Verificar que el nuevo nombre no esté en uso
    const existingZone = await this.zoneRepository.findByName(dto.name);
    if (existingZone && existingZone.id !== dto.zoneId) {
      throw ConflictException.zoneAlreadyExists(dto.name);
    }

    zone.updateName(dto.name);
    await this.zoneRepository.update(zone);
  }
}