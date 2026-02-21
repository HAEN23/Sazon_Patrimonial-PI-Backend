export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    this.value = password;
    this.isHashed = isHashed;
  }

  private isValid(password: string): boolean {
    if (!password || password.length < 6) {
      return false;
    }

    if (password.length > 100) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getIsHashed(): boolean {
    return this.isHashed;
  }

  // Validación de fortaleza de contraseña
  getStrength(): 'weak' | 'medium' | 'strong' {
    if (this.isHashed) {
      return 'strong'; // Asumimos que contraseñas hasheadas son seguras
    }

    const password = this.value;
    let strength = 0;

    // Longitud
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Contiene minúsculas
    if (/[a-z]/.test(password)) strength++;

    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) strength++;

    // Contiene números
    if (/[0-9]/.test(password)) strength++;

    // Contiene caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  // Validar requisitos específicos
  hasMinimumLength(): boolean {
    return this.value.length >= 6;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.value);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.value);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.value);
  }

  hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.value);
  }

  toString(): string {
    return this.value;
  }

  // No permitir ver la contraseña en JSON
  toJSON(): string {
    return '******';
  }
}