import { DomainException } from './DomainException';

/**
 * Excepción cuando no hay autenticación válida
 * Se lanza cuando se requiere autenticación y no está presente o es inválida
 */
export class UnauthorizedException extends DomainException {
  public readonly reason?: string;

  constructor(message: string = 'No autorizado', reason?: string) {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedException';
    this.reason = reason;

    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }

  /**
   * Crea una excepción para credenciales inválidas
   */
  static invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException(
      'Credenciales inválidas',
      'INVALID_CREDENTIALS'
    );
  }

  /**
   * Crea una excepción para token inválido
   */
  static invalidToken(): UnauthorizedException {
    return new UnauthorizedException(
      'Token de autenticación inválido',
      'INVALID_TOKEN'
    );
  }

  /**
   * Crea una excepción para token expirado
   */
  static tokenExpired(): UnauthorizedException {
    return new UnauthorizedException(
      'Token de autenticación expirado',
      'TOKEN_EXPIRED'
    );
  }

  /**
   * Crea una excepción para sesión no encontrada
   */
  static noSession(): UnauthorizedException {
    return new UnauthorizedException(
      'No hay sesión activa',
      'NO_SESSION'
    );
  }

  /**
   * Crea una excepción para email o contraseña incorrectos
   */
  static wrongEmailOrPassword(): UnauthorizedException {
    return new UnauthorizedException(
      'Email o contraseña incorrectos',
      'WRONG_CREDENTIALS'
    );
  }

  /**
   * Crea una excepción para usuario no autenticado
   */
  static notAuthenticated(): UnauthorizedException {
    return new UnauthorizedException(
      'Debes iniciar sesión para acceder a este recurso',
      'NOT_AUTHENTICATED'
    );
  }

  /**
   * Crea una excepción para tipo de usuario incorrecto
   */
  static wrongUserType(expectedType: string): UnauthorizedException {
    return new UnauthorizedException(
      `Este usuario no está registrado como ${expectedType}`,
      'WRONG_USER_TYPE'
    );
  }

  /**
   * Convierte a JSON incluyendo el motivo
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      reason: this.reason,
    };
  }

  /**
   * Verifica si es una excepción de no autorizado
   */
  static is(error: any): error is UnauthorizedException {
    return error instanceof UnauthorizedException;
  }
}