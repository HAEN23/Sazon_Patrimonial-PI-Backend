/**
 * Excepción base del dominio
 * Todas las excepciones de dominio deben heredar de esta clase
 */
export class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = 'DOMAIN_ERROR',
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'DomainException';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();

    // Mantener el stack trace correcto
    Object.setPrototypeOf(this, DomainException.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convierte la excepción a un objeto JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Convierte la excepción a string
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  /**
   * Verifica si la excepción es de un tipo específico
   */
  static is(error: any): error is DomainException {
    return error instanceof DomainException;
  }

  /**
   * Verifica si la excepción tiene un código específico
   */
  hasCode(code: string): boolean {
    return this.code === code;
  }
}