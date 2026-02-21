import { DomainException } from './DomainException';

/**
 * Excepción para errores de validación
 * Se lanza cuando los datos de entrada no cumplen con las reglas de negocio
 */
export class ValidationException extends DomainException {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[] = []) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationException';
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationException.prototype);
  }

  /**
   * Crea una excepción de validación desde un solo error
   */
  static fromSingleError(field: string, message: string): ValidationException {
    return new ValidationException(message, [{ field, message }]);
  }

  /**
   * Crea una excepción de validación desde múltiples errores
   */
  static fromMultipleErrors(errors: ValidationError[]): ValidationException {
    const message = `Errores de validación: ${errors.map(e => e.field).join(', ')}`;
    return new ValidationException(message, errors);
  }

  /**
   * Verifica si hay un error específico en un campo
   */
  hasErrorInField(field: string): boolean {
    return this.errors.some(error => error.field === field);
  }

  /**
   * Obtiene el error de un campo específico
   */
  getErrorForField(field: string): ValidationError | undefined {
    return this.errors.find(error => error.field === field);
  }

  /**
   * Obtiene todos los mensajes de error
   */
  getAllMessages(): string[] {
    return this.errors.map(error => error.message);
  }

  /**
   * Convierte a JSON incluyendo los errores de validación
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }

  /**
   * Verifica si es una excepción de validación
   */
  static is(error: any): error is ValidationException {
    return error instanceof ValidationException;
  }
}

/**
 * Tipo para representar un error de validación individual
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}