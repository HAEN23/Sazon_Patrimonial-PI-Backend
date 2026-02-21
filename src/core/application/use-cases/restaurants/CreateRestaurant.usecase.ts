import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { Restaurant } from '@/core/domain/entities/Restaurant.entity';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';

export interface CreateRestaurantDto {
  name: string;
  schedule: string;
  phone: string;
  tags: string[];
  address: string;
  facebook?: string;
  instagram?: string;
  ownerId: number;
  applicationId: number;
}

/**
 * Caso de uso: Crear un nuevo restaurante
 */
export class CreateRestaurantUseCase {
  constructor(
    private readonly restaurantRepository: IRestaurantRepository,
    private readonly applicationRepository: IApplicationRepository
  ) {}

  async execute(dto: CreateRestaurantDto): Promise<Restaurant> {
    // 1. Verificar que la solicitud existe y está aprobada
    const application = await this.applicationRepository.findById(dto.applicationId);
    if (!application) {
      throw NotFoundException.applicationNotFound(dto.applicationId);
    }

    if (!application.isApproved()) {
      throw new ValidationException('La solicitud debe estar aprobada para crear el restaurante');
    }

    // 2. Verificar que no exista ya un restaurante con esta solicitud
    const existingRestaurant = await this.restaurantRepository.existsByApplicationId(
      dto.applicationId
    );
    if (existingRestaurant) {
      throw new ConflictException(
        'Ya existe un restaurante asociado a esta solicitud',
        'RESTAURANT_ALREADY_EXISTS'
      );
    }

    // 3. Crear restaurante
    const restaurant = Restaurant.create(dto);

    // 4. Guardar
    return await this.restaurantRepository.save(restaurant);
  }
}