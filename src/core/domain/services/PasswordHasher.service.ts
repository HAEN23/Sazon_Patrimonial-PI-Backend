/**
 * Interface para el servicio de hash de contraseñas
 * Define el contrato que debe implementar cualquier estrategia de hash
 * (bcrypt, argon2, scrypt, etc.)
 */
export interface IPasswordHasher {
  /**
   * Genera un hash de una contraseña en texto plano
   * @param password - Contraseña en texto plano
   * @returns Promise con el hash generado
   */
  hash(password: string): Promise<string>;

  /**
   * Compara una contraseña en texto plano con un hash
   * @param password - Contraseña en texto plano
   * @param hashedPassword - Hash de la contraseña
   * @returns Promise<boolean> true si coinciden, false si no
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;

  /**
   * Verifica si un hash necesita ser rehaseado
   * (útil si cambió la configuración de seguridad)
   * @param hashedPassword - Hash a verificar
   * @returns Promise<boolean> true si necesita rehash
   */
  needsRehash?(hashedPassword: string): Promise<boolean>;

  /**
   * Obtiene información sobre el algoritmo de hash usado
   * @returns Información del algoritmo (opcional)
   */
  getAlgorithmInfo?(): {
    name: string;
    version?: string;
    rounds?: number;
  };
}

/**
 * Servicio de dominio para validación de contraseñas
 */
export class PasswordValidationService {
  /**
   * Valida la fortaleza de una contraseña
   * @param password - Contraseña a validar
   * @returns objeto con el resultado de la validación
   */
  static validateStrength(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Validaciones básicas
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
      suggestions.push('Usa al menos 8 caracteres para mayor seguridad');
    } else {
      score++;
    }

    // Longitud recomendada
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Contiene minúsculas
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      suggestions.push('Agrega letras minúsculas');
    }

    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      suggestions.push('Agrega letras mayúsculas');
    }

    // Contiene números
    if (/[0-9]/.test(password)) {
      score++;
    } else {
      suggestions.push('Agrega números');
    }

    // Contiene caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) {
      score++;
    } else {
      suggestions.push('Agrega caracteres especiales (!@#$%^&*)');
    }

    // No contiene patrones comunes
    const commonPatterns = [
      /^123+/,
      /^abc+/i,
      /password/i,
      /^qwerty/i,
      /^(.)\1{2,}/, // Caracteres repetidos
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        score--;
        errors.push('La contraseña contiene patrones comunes o débiles');
        break;
      }
    }

    // Determinar fortaleza
    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 2) {
      strength = 'weak';
    } else if (score <= 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: errors.length === 0 && password.length >= 6,
      strength,
      errors,
      suggestions: strength === 'strong' ? [] : suggestions,
    };
  }

  /**
   * Genera una contraseña aleatoria segura
   * @param length - Longitud de la contraseña (por defecto 12)
   * @returns Contraseña generada
   */
  static generateSecure(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Asegurar al menos un carácter de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Rellenar el resto
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar caracteres
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Calcula el tiempo estimado para crackear una contraseña
   * @param password - Contraseña a analizar
   * @returns Tiempo estimado en formato legible
   */
  static estimateCrackTime(password: string): string {
    const charsetSize = this.getCharsetSize(password);
    const combinations = Math.pow(charsetSize, password.length);
    
    // Asumiendo 1 billón de intentos por segundo
    const secondsToCrack = combinations / 1_000_000_000_000;

    if (secondsToCrack < 1) return 'Instantáneo';
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} segundos`;
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutos`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} horas`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} días`;
    if (secondsToCrack < 31536000 * 100) return `${Math.round(secondsToCrack / 31536000)} años`;
    
    return 'Más de 100 años';
  }

  private static getCharsetSize(password: string): number {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Caracteres especiales aproximados
    return size;
  }

  /**
   * Verifica si una contraseña está en una lista de contraseñas comprometidas
   * (requeriría integración con un servicio como Have I Been Pwned)
   * @param password - Contraseña a verificar
   * @returns Promise<boolean> true si está comprometida
   */
  static async isCompromised(password: string): Promise<boolean> {
    // Implementación básica - en producción integrar con API externa
    const commonPasswords = [
      '123456',
      'password',
      '12345678',
      'qwerty',
      '123456789',
      '12345',
      '1234',
      '111111',
      '1234567',
      'dragon',
      '123123',
      'baseball',
      'iloveyou',
      'trustno1',
      '1234567890',
      'sunshine',
      'master',
      'welcome',
      'shadow',
      'ashley',
      'football',
      'jesus',
      'michael',
      'ninja',
      'mustang',
      'password1',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }
}