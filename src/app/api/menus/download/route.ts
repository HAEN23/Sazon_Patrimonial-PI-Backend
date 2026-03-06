import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { clientAuthMiddleware } from '@/core/infrastructure/http/middleware/client-auth.middleware';
import { validateBody } from '@/core/infrastructure/http/middleware/validation.middleware';
import { downloadMenuSchema } from '@/core/infrastructure/http/validators/menu.validator';
import { DownloadMenuUseCase } from '@/core/application/use-cases/menus/DownloadMenu.usecase';
import { PrismaMenuRepository } from '@/core/infrastructure/database/repositories/PrismaMenuRepository';
import { PrismaFavoriteRepository } from '@/core/infrastructure/database/repositories/PrismaFavoriteRepository';

interface DownloadMenuDto {
  restaurantId: number;
}

/**
 * POST /api/menus/download
 * Descargar menú (requiere like)
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const client = await clientAuthMiddleware(request);
    const body = await validateBody<DownloadMenuDto>(request, downloadMenuSchema);

    const menuRepository = new PrismaMenuRepository();
    const favoriteRepository = new PrismaFavoriteRepository();

    const useCase = new DownloadMenuUseCase(menuRepository, favoriteRepository);
    
    const result = await useCase.execute(client.clientId, body.restaurantId);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Menú disponible para descarga',
    });
  })(request);
}