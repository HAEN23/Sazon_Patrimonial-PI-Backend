export class Email {
  private readonly value: string;

  constructor(email: string) {
    const trimmed = email.trim();
    
    if (!this.isValid(trimmed)) {
      throw new Error('Email inválido');
    }
    
    this.value = trimmed.toLowerCase();
  }

  private isValid(email: string): boolean {
    if (!email || email.length === 0) {
      return false;
    }

    // Regex completo para validar emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    // Validaciones adicionales
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domainPart] = parts;

    // Validar parte local (antes del @)
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Validar dominio (después del @)
    if (domainPart.length === 0 || domainPart.length > 255) {
      return false;
    }

    // No debe empezar o terminar con punto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    // No debe tener puntos consecutivos
    if (localPart.includes('..')) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Método para ocultar parte del email (para privacidad)
  toMasked(): string {
    const [local, domain] = this.value.split('@');
    if (local.length <= 3) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.substring(0, 3)}***@${domain}`;
  }
}