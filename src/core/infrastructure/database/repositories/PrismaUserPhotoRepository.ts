import { prisma } from '../prisma-client';
import { IUserPhotoRepository } from '@/core/domain/repositories/IUserPhotoRepository';
import { UserPhoto } from '@/core/domain/entities/UserPhoto.entity';

export class PrismaUserPhotoRepository implements IUserPhotoRepository {
  async findAll(): Promise<UserPhoto[]> {
    const photos = await prisma.userPhoto.findMany({
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return photos.map((photo: any) => UserPhoto.fromPrisma(photo));
  }

  async findById(id: number): Promise<UserPhoto | null> {
    const photo = await prisma.userPhoto.findUnique({
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

    return photo ? UserPhoto.fromPrisma(photo) : null;
  }

  async findByClientId(clientId: number): Promise<UserPhoto[]> {
    const photos = await prisma.userPhoto.findMany({
      where: { clientId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return photos.map((photo: any) => UserPhoto.fromPrisma(photo));
  }

  async findByRestaurantId(restaurantId: number): Promise<UserPhoto[]> {
    const photos = await prisma.userPhoto.findMany({
      where: { restaurantId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return photos.map((photo: any) => UserPhoto.fromPrisma(photo));
  }

  async save(photo: UserPhoto): Promise<UserPhoto> {
    const created = await prisma.userPhoto.create({
      data: {
        photoUrl: photo.photoUrl.getValue(),
        clientId: photo.clientId,
        restaurantId: photo.restaurantId,
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

    return UserPhoto.fromPrisma(created);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.userPhoto.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async countByRestaurant(restaurantId: number): Promise<number> {
    return await prisma.userPhoto.count({
      where: { restaurantId },
    });
  }

  async countByClient(clientId: number): Promise<number> {
    return await prisma.userPhoto.count({
      where: { clientId },
    });
  }

  async findRecentByRestaurant(
    restaurantId: number,
    limit: number
  ): Promise<UserPhoto[]> {
    const photos = await prisma.userPhoto.findMany({
      where: { restaurantId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: limit,
    });

    return photos.map((photo: any) => UserPhoto.fromPrisma(photo));
  }

  async findRestaurantsWithMostPhotos(
    limit: number
  ): Promise<Array<{ restaurantId: number; count: number }>> {
    const results = await prisma.userPhoto.groupBy({
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