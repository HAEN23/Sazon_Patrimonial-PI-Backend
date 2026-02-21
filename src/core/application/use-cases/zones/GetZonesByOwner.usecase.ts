import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';

export interface GetZonesByOwnerResult {
  zones: Array<{
    id: number;
    name: string;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener zonas de un propietario
 */
export class GetZonesByOwnerUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(ownerId: number): Promise<GetZonesByOwnerResult> {
    const zones = await this.zoneRepository.findByOwnerId(ownerId);

    const zonesData = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      createdAt: zone.createdAt,
    }));

    return {
      zones: zonesData,
      total: zones.length,
    };
  }
}