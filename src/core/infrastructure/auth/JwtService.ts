import jwt from 'jsonwebtoken';

export interface JwtPayloadData {
  userId: number;
  email: string;
  type: string;
}

export interface JwtPayload extends JwtPayloadData {
  exp?: number;
  iat?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Servicio para gestión de JWT
 */
export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    this.accessTokenExpiry = (process.env.JWT_ACCESS_EXPIRY || '15m');
    this.refreshTokenExpiry = (process.env.JWT_REFRESH_EXPIRY || '7d');
  }

  /**
   * Generar tokens de acceso y refresh
   */
  generateTokens(payload: JwtPayloadData): JwtTokens {
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  /**
   * Generar solo token de acceso
   */
  generateAccessToken(payload: JwtPayloadData): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verificar y decodificar token de acceso
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      throw new Error('Token inválido');
    }
  }

  /**
   * Verificar y decodificar refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Decodificar token sin verificar (para debug)
   */
  decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verificar si un token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}