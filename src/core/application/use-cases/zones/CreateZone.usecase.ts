import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';
import { Zone } from '@/core/domain/entities/Zone.entity';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';

export interface CreateZoneDto {
  name: string;
  ownerId: number;
}

/**
 * Caso de uso: Crear una nueva zona
 */
export class CreateZoneUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(dto: CreateZoneDto): Promise<Zone> {
    // Verificar que no exista una zona con ese nombre
    const existingZone = await this.zoneRepository.findByName(dto.name);
    if (existingZone) {
      throw ConflictException.zoneAlreadyExists(dto.name);
    }

    // Crear zona
    const zone = Zone.create(dto);

    return await this.zoneRepository.save(zone);
  }
}