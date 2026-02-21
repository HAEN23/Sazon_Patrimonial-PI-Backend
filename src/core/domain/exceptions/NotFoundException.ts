import { DomainException } from './DomainException';

/**
 * Excepción cuando un recurso no se encuentra
 * Se lanza cuando se intenta acceder a un recurso que no existe
 */
export class NotFoundException extends DomainException {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string | number
  ) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundException';
    this.resourceType = resourceType;
    this.resourceId = resourceId;

    Object.setPrototypeOf(this, NotFoundException.prototype);
  }

  /**
   * Crea una excepción para un recurso específico
   */
  static forResource(
    resourceType: string,
    resourceId: string | number
  ): NotFoundException {
    return new NotFoundException(
      `${resourceType} con ID ${resourceId} no encontrado`,
      resourceType,
      resourceId
    );
  }

  /**
   * Crea una excepción para un usuario no encontrado
   */
  static userNotFound(userId: number): NotFoundException {
    return this.forResource('Usuario', userId);
  }

  /**
   * Crea una excepción para un restaurante no encontrado
   */
  static restaurantNotFound(restaurantId: number): NotFoundException {
    return this.forResource('Restaurante', restaurantId);
  }

  /**
   * Crea una excepción para un cliente no encontrado
   */
  static clientNotFound(clientId: number): NotFoundException {
    return this.forResource('Cliente', clientId);
  }

  /**
   * Crea una excepción para un menú no encontrado
   */
  static menuNotFound(menuId: number): NotFoundException {
    return this.forResource('Menú', menuId);
  }

  /**
   * Crea una excepción para un favorito no encontrado
   */
  static favoriteNotFound(favoriteId: number): NotFoundException {
    return this.forResource('Favorito', favoriteId);
  }

  /**
   * Crea una excepción para una foto no encontrada
   */
  static photoNotFound(photoId: number): NotFoundException {
    return this.forResource('Foto', photoId);
  }

  /**
   * Crea una excepción para una solicitud no encontrada
   */
  static applicationNotFound(applicationId: number): NotFoundException {
    return this.forResource('Solicitud', applicationId);
  }

  /**
   * Crea una excepción para una zona no encontrada
   */
  static zoneNotFound(zoneId: number): NotFoundException {
    return this.forResource('Zona', zoneId);
  }

  /**
   * Crea una excepción genérica para recurso no encontrado
   */
  static generic(resourceName: string): NotFoundException {
    return new NotFoundException(`${resourceName} no encontrado`);
  }

  /**
   * Convierte a JSON incluyendo información del recurso
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      resourceType: this.resourceType,
      resourceId: this.resourceId,
    };
  }

  /**
   * Verifica si es una excepción de recurso no encontrado
   */
  static is(error: any): error is NotFoundException {
    return error instanceof NotFoundException;
  }
}