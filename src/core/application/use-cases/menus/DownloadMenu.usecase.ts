import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { ForbiddenException } from '@/core/domain/exceptions/ForbiddenException';
import { NotFoundException } from '@/core/domain/exceptions/NotFoundException';

export interface DownloadMenuResult {
  menuUrl: string;
  fileName: string;
}

/**
 * Caso de uso: Descargar menú
 * El cliente debe tener el restaurante en favoritos
 */
export class DownloadMenuUseCase {
  constructor(
    private readonly menuRepository: IMenuRepository,
    private readonly favoriteRepository: IFavoriteRepository
  ) {}

  async execute(clientId: number, restaurantId: number): Promise<DownloadMenuResult> {
    // 1. Verificar que el cliente tiene el restaurante en favoritos
    const hasFavorite = await this.favoriteRepository.findByClientAndRestaurant(
      clientId,
      restaurantId
    );

    if (!hasFavorite) {
      throw ForbiddenException.likeRequired();
    }

    // 2. Obtener menú activo
    const menu = await this.menuRepository.findActiveByRestaurant(restaurantId);
    if (!menu) {
      throw new NotFoundException('No hay menú disponible para este restaurante');
    }

    // 3. Incrementar contador de descargas
    await this.menuRepository.incrementDownloadCount(menu.id);

    return {
      menuUrl: menu.menuUrl.getValue(),
      fileName: `menu-restaurante-${restaurantId}.pdf`,
    };
  }
}