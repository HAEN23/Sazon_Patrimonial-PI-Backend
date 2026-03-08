import { prisma } from '../prisma-client';
import { IClientRepository } from '@/core/domain/repositories/IClientRepository';
import { Client } from '@/core/domain/entities/Client.entity';

export class PrismaClientRepository implements IClientRepository {
  async findAll(): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      include: {
        user: true,
      },
    });

    return clients.map((client: any) => Client.fromPrisma(client));
  }

  async findByUserId(userId: number): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    return client ? Client.fromPrisma(client) : null;
  }

  async save(client: Client): Promise<Client> {
    const created = await prisma.client.create({
      data: {
        userId: client.userId,
        phone: client.phone,
      },
      include: {
        user: true,
      },
    });

    return Client.fromPrisma(created);
  }

  async update(client: Client): Promise<Client> {
    const updated = await prisma.client.update({
      where: { userId: client.userId },
      data: {
        phone: client.phone,
      },
      include: {
        user: true,
      },
    });

    return Client.fromPrisma(updated);
  }

  async delete(userId: number): Promise<boolean> {
    try {
      await prisma.client.delete({
        where: { userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByUserId(userId: number): Promise<boolean> {
    const count = await prisma.client.count({
      where: { userId },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.client.count();
  }

  async findMostActive(limit: number): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      include: {
        user: {
          include: {
            favoritos: true,
          },
        },
      },
      take: limit,
    });

    // Ordenar por cantidad de favoritos en memoria
    const sorted = clients.sort((a: any, b: any) => {
      const aCount = a.user?.favoritos?.length || 0;
      const bCount = b.user?.favoritos?.length || 0;
      return bCount - aCount;
    });

    return sorted.map((client: any) => Client.fromPrisma(client));
  }
}