import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';

/**
 * Middleware genérico de validación con Zod
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body); // Lanza ZodError si falla
}

/**
 * Middleware para validar query params
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const { searchParams } = new URL(request.url);
  const queryObject = Object.fromEntries(searchParams.entries());
  return schema.parse(queryObject);
}

/**
 * Middleware para validar params de URL
 */
export function validateParams<T>(
  params: any,
  schema: ZodSchema<T>
): T {
  return schema.parse(params);
}