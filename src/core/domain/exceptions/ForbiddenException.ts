import { DomainException } from './DomainException';

/**
 * Excepción cuando no hay permisos suficientes
 * Se lanza cuando el usuario está autenticado pero no tiene permisos
 * para realizar la acción solicitada
 */
export class ForbiddenException extends DomainException {
  public readonly requiredPermission?: string;
  public readonly reason?: string;

  constructor(
    message: string,
    requiredPermission?: string,
    reason?: string
  ) {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenException';
    this.requiredPermission = requiredPermission;
    this.reason = reason;

    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }

  /**
   * Crea una excepción para acceso denegado genérico
   */
  static accessDenied(): ForbiddenException {
    return new ForbiddenException(
      'No tienes permiso para acceder a este recurso',
      undefined,
      'ACCESS_DENIED'
    );
  }

  /**
   * Crea una excepción para acción no permitida
   */
  static actionNotAllowed(action: string): ForbiddenException {
    return new ForbiddenException(
      `No tienes permiso para: ${action}`,
      action,
      'ACTION_NOT_ALLOWED'
    );
  }

  /**
   * Crea una excepción para recurso de otro usuario
   */
  static notYourResource(resourceType: string): ForbiddenException {
    return new ForbiddenException(
      `No puedes acceder a este ${resourceType} porque no te pertenece`,
      undefined,
      'NOT_OWNER'
    );
  }

  /**
   * Crea una excepción para rol insuficiente
   */
  static insufficientRole(requiredRole: string): ForbiddenException {
    return new ForbiddenException(
      `Se requiere rol de ${requiredRole}`,
      requiredRole,
      'INSUFFICIENT_ROLE'
    );
  }

  /**
   * Crea una excepción para like requerido
   */
  static likeRequired(): ForbiddenException {
    return new ForbiddenException(
      'Debes agregar el restaurante a favoritos antes de descargar el menú',
      'LIKE_REQUIRED',
      'LIKE_REQUIRED'
    );
  }

  /**
   * Crea una excepción para favorito requerido para subir foto
   */
  static favoriteRequiredForPhoto(): ForbiddenException {
    return new ForbiddenException(
      'Solo puedes subir fotos de restaurantes que hayas marcado como favoritos',
      'FAVORITE_REQUIRED',
      'FAVORITE_REQUIRED'
    );
  }

  /**
   * Crea una excepción para cuenta suspendida
   */
  static accountSuspended(): ForbiddenException {
    return new ForbiddenException(
      'Tu cuenta ha sido suspendida',
      undefined,
      'ACCOUNT_SUSPENDED'
    );
  }

  /**
   * Crea una excepción para restaurante inactivo
   */
  static restaurantInactive(): ForbiddenException {
    return new ForbiddenException(
      'Este restaurante está inactivo',
      undefined,
      'RESTAURANT_INACTIVE'
    );
  }

  /**
   * Crea una excepción para menú no disponible
   */
  static menuNotAvailable(): ForbiddenException {
    return new ForbiddenException(
      'El menú no está disponible en este momento',
      undefined,
      'MENU_NOT_AVAILABLE'
    );
  }

  /**
   * Crea una excepción para límite alcanzado
   */
  static limitReached(limitType: string): ForbiddenException {
    return new ForbiddenException(
      `Has alcanzado el límite de ${limitType}`,
      limitType,
      'LIMIT_REACHED'
    );
  }

  /**
   * Convierte a JSON incluyendo permisos requeridos
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
      reason: this.reason,
    };
  }

  /**
   * Verifica si es una excepción de prohibido
   */
  static is(error: any): error is ForbiddenException {
    return error instanceof ForbiddenException;
  }
}