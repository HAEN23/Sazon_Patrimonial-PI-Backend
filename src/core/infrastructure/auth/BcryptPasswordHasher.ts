import { IPasswordHasher } from '@/core/domain/services/PasswordHasher.service';
import bcrypt from 'bcrypt';

/**
 * Implementación de hash de contraseñas con Bcrypt
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async needsRehash(hashedPassword: string): Promise<boolean> {
    try {
      // Extraer el número de rounds del hash
      const rounds = this.extractRounds(hashedPassword);
      return rounds !== this.saltRounds;
    } catch {
      return true;
    }
  }

  getAlgorithmInfo() {
    return {
      name: 'bcrypt',
      rounds: this.saltRounds,
    };
  }

  private extractRounds(hashedPassword: string): number {
    // Formato bcrypt: $2b$10$... (donde 10 son los rounds)
    const parts = hashedPassword.split('$');
    if (parts.length >= 3) {
      return parseInt(parts[2], 10);
    }
    throw new Error('Hash inválido');
  }
}