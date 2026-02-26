import { NextResponse } from 'next/server';
import { DomainException } from '@/core/domain/exceptions/DomainException';
import { ValidationException } from '@/core/domain/exceptions/ValidationException';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';
import { UnauthorizedException } from '@/core/domain/exceptions/UnauthorizedException';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { ConflictException } from '@/core/domain/exceptions/ConflictException';
import { ZodError } from 'zod';
import { logger } from '@/core/infrastructure/logging/WinstonLogger';

/**
 * Manejador global de errores
 */
export function handleError(error: unknown): NextResponse {
  // Log del error
  if (error instanceof Error) {
    logger.error('Error en API:', error);
  }

  // Errores de validación de Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Errores de validación',
        details: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Excepciones de dominio
  if (ValidationException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errors: error.errors,
      },
      { status: 400 }
    );
  }

  if (NotFoundException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        resourceType: error.resourceType,
        resourceId: error.resourceId,
      },
      { status: 404 }
    );
  }

  if (UnauthorizedException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        reason: error.reason,
      },
      { status: 401 }
    );
  }

  if (ForbiddenException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        requiredPermission: error.requiredPermission,
        reason: error.reason,
      },
      { status: 403 }
    );
  }

  if (ConflictException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        conflictType: error.conflictType,
      },
      { status: 409 }
    );
  }

  if (DomainException.is(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Error genérico
  return NextResponse.json(
    {
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : undefined,
    },
    { status: 500 }
  );
}

/**
 * Wrapper para manejar errores en route handlers
 */
export function withErrorHandler(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}