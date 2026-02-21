import { DomainException } from './DomainException';

/**
 * Excepción cuando hay un conflicto con el estado actual
 * Se lanza cuando se intenta crear/actualizar un recurso que entra en conflicto
 * con las reglas de negocio o con recursos existentes
 */
export class ConflictException extends DomainException {
  public readonly conflictType?: string;
  public readonly conflictingValue?: any;

  constructor(
    message: string,
    conflictType?: string,
    conflictingValue?: any
  ) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictException';
    this.conflictType = conflictType;
    this.conflictingValue = conflictingValue;

    Object.setPrototypeOf(this, ConflictException.prototype);
  }

  /**
   * Crea una excepción para email duplicado
   */
  static emailAlreadyExists(email: string): ConflictException {
    return new ConflictException(
      'El correo electrónico ya está registrado',
      'DUPLICATE_EMAIL',
      email
    );
  }

  /**
   * Crea una excepción para usuario duplicado
   */
  static userAlreadyExists(identifier: string): ConflictException {
    return new ConflictException(
      'Ya existe un usuario con estos datos',
      'DUPLICATE_USER',
      identifier
    );
  }

  /**
   * Crea una excepción para restaurante duplicado
   */
  static restaurantAlreadyExists(name: string): ConflictException {
    return new ConflictException(
      `Ya existe un restaurante con el nombre "${name}"`,
      'DUPLICATE_RESTAURANT',
      name
    );
  }

  /**
   * Crea una excepción para favorito duplicado
   */
  static favoriteAlreadyExists(): ConflictException {
    return new ConflictException(
      'Este restaurante ya está en tus favoritos',
      'DUPLICATE_FAVORITE'
    );
  }

  /**
   * Crea una excepción para solicitud duplicada
   */
  static applicationAlreadyExists(): ConflictException {
    return new ConflictException(
      'Ya tienes una solicitud pendiente',
      'DUPLICATE_APPLICATION'
    );
  }

  /**
   * Crea una excepción para encuesta duplicada
   */
  static surveyAlreadySubmitted(): ConflictException {
    return new ConflictException(
      'Ya has respondido esta encuesta',
      'DUPLICATE_SURVEY'
    );
  }

  /**
   * Crea una excepción para zona duplicada
   */
  static zoneAlreadyExists(name: string): ConflictException {
    return new ConflictException(
      `Ya existe una zona con el nombre "${name}"`,
      'DUPLICATE_ZONE',
      name
    );
  }

  /**
   * Crea una excepción para estado inválido
   */
  static invalidState(message: string): ConflictException {
    return new ConflictException(message, 'INVALID_STATE');
  }

  /**
   * Crea una excepción para recurso en uso
   */
  static resourceInUse(resourceType: string): ConflictException {
    return new ConflictException(
      `No se puede eliminar ${resourceType} porque está en uso`,
      'RESOURCE_IN_USE',
      resourceType
    );
  }

  /**
   * Convierte a JSON incluyendo información del conflicto
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      conflictType: this.conflictType,
      conflictingValue: this.conflictingValue,
    };
  }

  /**
   * Verifica si es una excepción de conflicto
   */
  static is(error: any): error is ConflictException {
    return error instanceof ConflictException;
  }
}