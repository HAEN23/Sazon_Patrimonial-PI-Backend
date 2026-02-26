import { NextRequest, NextResponse } from 'next/server';
import { JwtService } from '@/core/infrastructure/auth/JwtService';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { UserType } from '@/core/domain/enums/UserType.enum';

const jwtService = new JwtService();

/**
 * Middleware de autenticación para Admin y Restaurantero
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Obtener token del header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw UnauthorizedException.notAuthenticated();
    }

    const token = authHeader.substring(7); // Quitar "Bearer "

    // Verificar token
    const payload = jwtService.verifyAccessToken(token);

    // Validar tipo de usuario (NO cliente)
    if (payload.type === UserType.CLIENT) {
      throw UnauthorizedException.wrongUserType('administrador o restaurantero');
    }

    // Agregar usuario al request
    return {
      userId: payload.userId,
      email: payload.email,
      type: payload.type,
    };
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    throw UnauthorizedException.invalidToken();
  }
}

/**
 * Middleware para verificar que sea Admin
 */
export async function adminMiddleware(request: NextRequest) {
  const user = await authMiddleware(request);

  if (user.type !== UserType.ADMIN) {
    throw new UnauthorizedException('Se requiere rol de administrador');
  }

  return user;
}

/**
 * Middleware para verificar que sea Restaurantero
 */
export async function restaurantOwnerMiddleware(request: NextRequest) {
  const user = await authMiddleware(request);

  if (user.type !== UserType.RESTAURANT_OWNER) {
    throw new UnauthorizedException('Se requiere rol de restaurantero');
  }

  return user;
}