import { prisma } from '../prisma-client';
import { IRestaurantOwnerRepository } from '@/core/domain/repositories/IRestaurantOwnerRepository';
import { RestaurantOwner } from '@/core/domain/entities/RestaurantOwner.entity';

export class PrismaRestaurantOwnerRepository implements IRestaurantOwnerRepository {
  async findAll(): Promise<RestaurantOwner[]> {
    const owners = await prisma.restaurantOwner.findMany({
      include: {
        user: true,
        applications: true,
      },
    });

    return owners.map((owner: any) => RestaurantOwner.fromPrisma(owner));
  }

  async findByUserId(userId: number): Promise<RestaurantOwner | null> {
    const owner = await prisma.restaurantOwner.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    return owner ? RestaurantOwner.fromPrisma(owner) : null;
  }

  async save(owner: RestaurantOwner): Promise<RestaurantOwner> {
    const created = await prisma.restaurantOwner.create({
      data: {
        userId: owner.userId,
      },
      include: {
        user: true,
      },
    });

    return RestaurantOwner.fromPrisma(created);
  }

  async delete(userId: number): Promise<boolean> {
    try {
      await prisma.restaurantOwner.delete({
        where: { userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByUserId(userId: number): Promise<boolean> {
    const count = await prisma.restaurantOwner.count({
      where: { userId },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.restaurantOwner.count();
  }
}