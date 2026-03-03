import { prisma } from '../prisma-client';
import { IMenuRepository } from '@/core/domain/repositories/IMenuRepository';
import { Menu } from '@/core/domain/entities/Menu.entity';
import { MenuStatus } from '@/core/domain/enums/MenuStatus.enum';

export class PrismaMenuRepository implements IMenuRepository {
  async findAll(): Promise<Menu[]> {
    const menus = await prisma.menu.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return menus.map((menu: any) => Menu.fromPrisma(menu));
  }

  async findById(id: number): Promise<Menu | null> {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        restaurant: true,
      },
    });

    return menu ? Menu.fromPrisma(menu) : null;
  }

  async findByRestaurantId(restaurantId: number): Promise<Menu[]> {
    const menus = await prisma.menu.findMany({
      where: { restaurantId },
      include: {
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return menus.map((menu: any) => Menu.fromPrisma(menu));
  }

  async findByOwnerId(ownerId: number): Promise<Menu[]> {
    const menus = await prisma.menu.findMany({
      where: {
        restaurant: {
          ownerId: ownerId,
        },
      },
      include: {
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return menus.map((menu: any) => Menu.fromPrisma(menu));
  }

  async findByStatus(status: MenuStatus): Promise<Menu[]> {
    const menus = await prisma.menu.findMany({
      where: { status },
      include: {
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return menus.map((menu: any) => Menu.fromPrisma(menu));
  }

  async findActiveByRestaurant(restaurantId: number): Promise<Menu | null> {
    const menu = await prisma.menu.findFirst({
      where: {
        restaurantId,
        status: MenuStatus.ACTIVE,
      },
      include: {
        restaurant: true,
      },
    });

    return menu ? Menu.fromPrisma(menu) : null;
  }

  async save(menu: Menu): Promise<Menu> {
    const created = await prisma.menu.create({
      data: {
        fileUrl: menu.fileUrl.getValue(),
        menuUrl: menu.menuUrl.getValue(),
        status: menu.status,
        restaurantId: menu.restaurantId,
        downloadCount: 0,
      },
      include: {
        restaurant: true,
      },
    });

    return Menu.fromPrisma(created);
  }

  async update(menu: Menu): Promise<Menu> {
    const updated = await prisma.menu.update({
      where: { id: menu.id },
      data: {
        fileUrl: menu.fileUrl.getValue(),
        menuUrl: menu.menuUrl.getValue(),
        status: menu.status,
      },
      include: {
        restaurant: true,
      },
    });

    return Menu.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.menu.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await prisma.menu.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  async getTotalDownloadsByRestaurant(restaurantId: number): Promise<number> {
    const result = await prisma.menu.aggregate({
      where: { restaurantId },
      _sum: {
        downloadCount: true,
      },
    });
    return result._sum.downloadCount || 0;
  }

  async findMostDownloaded(limit: number): Promise<Menu[]> {
    const menus = await prisma.menu.findMany({
      include: {
        restaurant: true,
      },
      orderBy: {
        downloadCount: 'desc',
      },
      take: limit,
    });

    return menus.map((menu: any) => Menu.fromPrisma(menu));
  }

  async countByStatus(status: MenuStatus): Promise<number> {
    return await prisma.menu.count({
      where: { status },
    });
  }
}