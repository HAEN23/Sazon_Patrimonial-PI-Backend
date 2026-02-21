export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const cleaned = this.cleanPhone(phone);
    
    if (!this.isValid(cleaned)) {
      throw new Error('El teléfono debe tener 10 dígitos');
    }
    
    this.value = cleaned;
  }

  private cleanPhone(phone: string): string {
    // Remover espacios, guiones, paréntesis, etc.
    return phone.replace(/[\s\-\(\)\+]/g, '');
  }

  private isValid(phone: string): boolean {
    // Validar que sean exactamente 10 dígitos
    if (!/^[0-9]{10}$/.test(phone)) {
      return false;
    }

    // Validar que no sean todos el mismo dígito (ej: 0000000000)
    if (/^(\d)\1{9}$/.test(phone)) {
      return false;
    }

    // Validar prefijos válidos para México (opcional)
    // Los números móviles en México empiezan con 1-9
    const firstDigit = parseInt(phone[0]);
    if (firstDigit === 0) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  // Formato: (961) 123-4567
  getFormatted(): string {
    return `(${this.value.slice(0, 3)}) ${this.value.slice(3, 6)}-${this.value.slice(6)}`;
  }

  // Formato: 961 123 4567
  getFormattedWithSpaces(): string {
    return `${this.value.slice(0, 3)} ${this.value.slice(3, 6)} ${this.value.slice(6)}`;
  }

  // Formato: 961-123-4567
  getFormattedWithDashes(): string {
    return `${this.value.slice(0, 3)}-${this.value.slice(3, 6)}-${this.value.slice(6)}`;
  }

  // Para enlaces tel:
  toTelLink(): string {
    return `tel:+52${this.value}`;
  }

  // Para WhatsApp
  toWhatsAppLink(message?: string): string {
    const baseUrl = `https://wa.me/52${this.value}`;
    if (message) {
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
    return baseUrl;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.getFormatted();
  }
}