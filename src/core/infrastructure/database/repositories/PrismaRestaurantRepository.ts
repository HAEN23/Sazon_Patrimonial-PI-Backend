import { prisma } from '../prisma-client';
import { IRestaurantRepository } from '@/core/domain/repositories/IRestaurantRepository';
import { Restaurant } from '@/core/domain/entities/Restaurant.entity';

export class PrismaRestaurantRepository implements IRestaurantRepository {
  async findAll(): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
        menus: true,
        favorites: true,
        userPhotos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }

  async findById(id: number): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
        menus: true,
        favorites: true,
        userPhotos: true,
      },
    });

    return restaurant ? Restaurant.fromPrisma(restaurant) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
        menus: true,
      },
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }

  async findByZoneId(zoneId: number): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        application: {
          zoneId: zoneId,
        },
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }

  async findByTags(tags: string[]): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }

  async save(restaurant: Restaurant): Promise<Restaurant> {
    const created = await prisma.restaurant.create({
      data: {
        name: restaurant.name,
        schedule: restaurant.schedule,
        phone: restaurant.phone.getValue(),
        tags: restaurant.tags,
        address: restaurant.address,
        facebook: restaurant.facebook?.getValue(),
        instagram: restaurant.instagram?.getValue(),
        ownerId: restaurant.ownerId,
        applicationId: restaurant.applicationId,
        likesCount: 0,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
    });

    return Restaurant.fromPrisma(created);
  }

  async update(restaurant: Restaurant): Promise<Restaurant> {
    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: restaurant.name,
        schedule: restaurant.schedule,
        phone: restaurant.phone.getValue(),
        tags: restaurant.tags,
        address: restaurant.address,
        facebook: restaurant.facebook?.getValue(),
        instagram: restaurant.instagram?.getValue(),
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
    });

    return Restaurant.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.restaurant.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async incrementLikesCount(id: number): Promise<number> {
    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });
    return updated.likesCount;
  }

  async decrementLikesCount(id: number): Promise<number> {
    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });
    return updated.likesCount;
  }

  async existsByApplicationId(applicationId: number): Promise<boolean> {
    const count = await prisma.restaurant.count({
      where: { applicationId },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.restaurant.count();
  }

  async findMostPopular(limit: number): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: limit,
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }

  async searchByName(name: string): Promise<Restaurant[]> {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        application: true,
      },
    });

    return restaurants.map((r: any) => Restaurant.fromPrisma(r));
  }
}