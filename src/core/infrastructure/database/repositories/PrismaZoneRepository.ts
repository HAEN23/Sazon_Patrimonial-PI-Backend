import { prisma } from '../prisma-client';
import { IZoneRepository } from '@/core/domain/repositories/IZoneRepository';
import { Zone } from '@/core/domain/entities/Zone.entity';

export class PrismaZoneRepository implements IZoneRepository {
  async findAll(): Promise<Zone[]> {
    const zones = await prisma.zone.findMany({
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return zones.map((zone: any) => Zone.fromPrisma(zone));
  }

  async findById(id: number): Promise<Zone | null> {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return zone ? Zone.fromPrisma(zone) : null;
  }

  async findByName(name: string): Promise<Zone | null> {
    const zone = await prisma.zone.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return zone ? Zone.fromPrisma(zone) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Zone[]> {
    const zones = await prisma.zone.findMany({
      where: { ownerId },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return zones.map((zone: any) => Zone.fromPrisma(zone));
  }

  async save(zone: Zone): Promise<Zone> {
    const created = await prisma.zone.create({
      data: {
        name: zone.name,
        ownerId: zone.ownerId,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return Zone.fromPrisma(created);
  }

  async update(zone: Zone): Promise<Zone> {
    const updated = await prisma.zone.update({
      where: { id: zone.id },
      data: {
        name: zone.name,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return Zone.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.zone.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await prisma.zone.count({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.zone.count();
  }
}