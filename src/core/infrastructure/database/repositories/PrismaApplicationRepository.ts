import { prisma } from '../prisma-client';
import { IApplicationRepository } from '@/core/domain/repositories/IApplicationRepository';
import { Application } from '@/core/domain/entities/Application.entity';
import { ApplicationStatus } from '@/core/domain/enums/ApplicationStatus.enum';

export class PrismaApplicationRepository implements IApplicationRepository {
  async findAll(): Promise<Application[]> {
    const applications = await prisma.application.findMany({
      include: {
        owner: {
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

    return applications.map((app: any) => Application.fromPrisma(app));
  }

  async findById(id: number): Promise<Application | null> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return application ? Application.fromPrisma(application) : null;
  }

  async findByOwnerId(ownerId: number): Promise<Application[]> {
    const applications = await prisma.application.findMany({
      where: { ownerId },
      include: {
        owner: {
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

    return applications.map((app: any) => Application.fromPrisma(app));
  }

  async findByStatus(status: ApplicationStatus): Promise<Application[]> {
    const applications = await prisma.application.findMany({
      where: { status },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return applications.map((app: any) => Application.fromPrisma(app));
  }

  async save(application: Application): Promise<Application> {
    const created = await prisma.application.create({
      data: {
        proposedRestaurantName: application.proposedRestaurantName,
        ownerName: application.ownerName,
        email: application.email.getValue(),
        schedule: application.schedule,
        status: application.status,
        ownerId: application.ownerId,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
      },
    });

    return Application.fromPrisma(created);
  }

  async update(application: Application): Promise<Application> {
    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        proposedRestaurantName: application.proposedRestaurantName,
        ownerName: application.ownerName,
        email: application.email.getValue(),
        schedule: application.schedule,
        status: application.status,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return Application.fromPrisma(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.application.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async countByStatus(status: ApplicationStatus): Promise<number> {
    return await prisma.application.count({
      where: { status },
    });
  }

  async findPending(): Promise<Application[]> {
    return this.findByStatus(ApplicationStatus.PENDING);
  }

  async findRecent(limit: number): Promise<Application[]> {
    const applications = await prisma.application.findMany({
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return applications.map((app: any) => Application.fromPrisma(app));
  }
}