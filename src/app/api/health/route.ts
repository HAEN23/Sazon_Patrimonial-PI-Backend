import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/infrastructure/database/prisma-client';

/**
 * GET /api/health
 * Health check del servidor
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`,
        },
        api: {
          status: 'running',
          port: process.env.PORT || 3001,
        },
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        services: {
          database: {
            status: 'disconnected',
            error: (error as Error).message,
          },
          api: {
            status: 'running',
          },
        },
      },
      { status: 503 }
    );
  }
}