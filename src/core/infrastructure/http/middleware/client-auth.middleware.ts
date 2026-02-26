import { NextRequest } from 'next/server';
import { JwtService } from '@/core/infrastructure/auth/JwtService';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { UserType } from '@/core/domain/enums/UserType.enum';

const jwtService = new JwtService();

/**
 * Middleware de autenticación para Clientes
 */
export async function clientAuthMiddleware(request: NextRequest) {
  try {
    // Obtener token del header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw UnauthorizedException.notAuthenticated();
    }

    const token = authHeader.substring(7);

    // Verificar token
    const payload = jwtService.verifyAccessToken(token);

    // Validar que sea cliente
    if (payload.type !== UserType.CLIENT) {
      throw UnauthorizedException.wrongUserType('cliente');
    }

    // Agregar cliente al request
    return {
      clientId: payload.userId,
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
 * Middleware opcional de cliente (no lanza error si no hay token)
 */
export async function optionalClientAuthMiddleware(request: NextRequest) {
  try {
    return await clientAuthMiddleware(request);
  } catch {
    return null; // Sin usuario autenticado
  }
}