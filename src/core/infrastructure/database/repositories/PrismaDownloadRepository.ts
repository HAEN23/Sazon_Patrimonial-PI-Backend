import { prisma } from '../prisma-client';
import { IDownloadRepository } from '@/core/domain/repositories/IDownloadRepository';
import { Download } from '@/core/domain/entities/Download.entity';
import { DownloadOrigin } from '@/core/domain/enums/DownloadOrigin.enum';

export class PrismaDownloadRepository implements IDownloadRepository {
  async findAll(): Promise<Download[]> {
    const downloads = await prisma.download.findMany({
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return downloads.map((download: any) => Download.fromPrisma(download));
  }

  async findById(id: number): Promise<Download | null> {
    const download = await prisma.download.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return download ? Download.fromPrisma(download) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Download[]> {
    const downloads = await prisma.download.findMany({
      where: { ownerId },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return downloads.map((download: any) => Download.fromPrisma(download));
  }

  async findByOrigin(origin: DownloadOrigin): Promise<Download[]> {
    const downloads = await prisma.download.findMany({
      where: { origin },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return downloads.map((download: any) => Download.fromPrisma(download));
  }

  async save(download: Download): Promise<Download> {
    const created = await prisma.download.create({
      data: {
        ownerId: download.ownerId,
        origin: download.origin as any,
        opinion: download.opinion as any,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return Download.fromPrisma(created);
  }

  async update(download: Download): Promise<Download> {
    const updated = await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: download.downloadCount,
        origin: download.origin as any,
        opinion: download.opinion as any,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return Download.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.download.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async countByOrigin(origin: DownloadOrigin): Promise<number> {
    return await prisma.download.count({
      where: { origin },
    });
  }

  async getStats(): Promise<{
    total: number;
    national: number;
    foreign: number;
  }> {
    const total = await prisma.download.count();
    const national = await prisma.download.count({
      where: { origin: DownloadOrigin.NATIONAL },
    });
    const foreign = await prisma.download.count({
      where: { origin: DownloadOrigin.FOREIGN },
    });

    return { total, national, foreign };
  }
}