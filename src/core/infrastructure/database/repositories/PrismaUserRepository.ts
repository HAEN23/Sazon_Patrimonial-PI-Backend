import { prisma } from '../prisma-client';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';

export class PrismaUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return users.map((user: any) => User.fromPrisma(user));
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return user ? User.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return user ? User.fromPrisma(user) : null;
  }

  async findByType(type: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { type },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return users.map((user: any) => User.fromPrisma(user));
  }

  async save(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email.getValue(),
        password: user.password.getValue(),
        type: user.type,
      },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return User.fromPrisma(created);
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email.getValue(),
        password: user.password.getValue(),
        type: user.type,
      },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return User.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });

    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.user.count();
  }

  async countByType(type: string): Promise<number> {
    return await prisma.user.count({
      where: { type },
    });
  }
}