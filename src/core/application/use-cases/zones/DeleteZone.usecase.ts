import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { UserType } from '@/core/domain/enums/UserType.enum';

export interface DeleteZoneDto {
  zoneId: number;
  requesterId: number;
  requesterType: UserType;
}

/**
 * Caso de uso: Eliminar una zona
 */
export class DeleteZoneUseCase {
  constructor(
    private readonly zoneRepository: IZoneRepository,
    private readonly restaurantRepository: IRestaurantRepository
  ) {}

  async execute(dto: DeleteZoneDto): Promise<void> {
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

    // Verificar que no tenga restaurantes asociados
    const restaurants = await this.restaurantRepository.findByZoneId(dto.zoneId);
    if (restaurants.length > 0) {
      throw ConflictException.resourceInUse(
        'No se puede eliminar la zona porque tiene restaurantes asociados'
      );
    }

    await this.zoneRepository.delete(dto.zoneId);
  }
}