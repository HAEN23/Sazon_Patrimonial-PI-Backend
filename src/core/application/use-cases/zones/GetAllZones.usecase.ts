import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';

export interface GetAllZonesResult {
  zones: Array<{
    id: number;
    name: string;
    ownerId: number;
    createdAt: Date;
  }>;
  total: number;
}

/**
 * Caso de uso: Obtener todas las zonas
 */
export class GetAllZonesUseCase {
  constructor(private readonly zoneRepository: IZoneRepository) {}

  async execute(): Promise<GetAllZonesResult> {
    const zones = await this.zoneRepository.findAll();

    const zonesData = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      ownerId: zone.ownerId,
      createdAt: zone.createdAt,
    }));

    return {
      zones: zonesData,
      total: zones.length,
    };
  }
}