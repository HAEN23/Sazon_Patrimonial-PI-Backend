import { prisma } from '../prisma-client';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { Favorite } from '@/core/domain/entities/Favorite.entity';

export class PrismaFavoriteRepository implements IFavoriteRepository {
  async findAll(): Promise<Favorite[]> {
    const favorites = await prisma.favorite.findMany({
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return favorites.map((fav: any) => Favorite.fromPrisma(fav));
  }

  async findById(id: number): Promise<Favorite | null> {
    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return favorite ? Favorite.fromPrisma(favorite) : null;
  }

  async findByClientAndRestaurant(
    clientId: number,
    restaurantId: number
  ): Promise<Favorite | null> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        clientId_restaurantId: {
          clientId,
          restaurantId,
        },
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return favorite ? Favorite.fromPrisma(favorite) : null;
  }

  async findByClientId(clientId: number): Promise<Favorite[]> {
    const favorites = await prisma.favorite.findMany({
      where: { clientId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return favorites.map((fav: any) => Favorite.fromPrisma(fav));
  }

  async findByRestaurantId(restaurantId: number): Promise<Favorite[]> {
    const favorites = await prisma.favorite.findMany({
      where: { restaurantId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return favorites.map((fav: any) => Favorite.fromPrisma(fav));
  }

  async save(favorite: Favorite): Promise<Favorite> {
    const created = await prisma.favorite.create({
      data: {
        clientId: favorite.clientId,
        restaurantId: favorite.restaurantId,
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return Favorite.fromPrisma(created);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.favorite.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async countByRestaurant(restaurantId: number): Promise<number> {
    return await prisma.favorite.count({
      where: { restaurantId },
    });
  }

  async countByClient(clientId: number): Promise<number> {
    return await prisma.favorite.count({
      where: { clientId },
    });
  }

  async existsByClientAndRestaurant(
    clientId: number,
    restaurantId: number
  ): Promise<boolean> {
    const count = await prisma.favorite.count({
      where: {
        clientId,
        restaurantId,
      },
    });

    return count > 0;
  }

  async findMostFavorited(
    limit: number
  ): Promise<Array<{ restaurantId: number; count: number }>> {
    const results = await prisma.favorite.groupBy({
      by: ['restaurantId'],
      _count: {
        restaurantId: true,
      },
      orderBy: {
        _count: {
          restaurantId: 'desc',
        },
      },
      take: limit,
    });

    return results.map((r: any) => ({
      restaurantId: r.restaurantId,
      count: r._count.restaurantId,
    }));
  }
}