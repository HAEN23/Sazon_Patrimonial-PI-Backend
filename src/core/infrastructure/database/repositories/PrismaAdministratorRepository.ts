import { prisma } from '../prisma-client';
import { IAdministratorRepository } from '@/core/domain/repositories/IAdministratorRepository';
import { Administrator } from '@/core/domain/entities/Administrador.entity';

export class PrismaAdministratorRepository implements IAdministratorRepository {
  async findAll(): Promise<Administrator[]> {
    const admins = await prisma.administrator.findMany({
      include: {
        user: true,
      },
    });

    return admins.map((admin: any) => Administrator.fromPrisma(admin));
  }

  async findByUserId(userId: number): Promise<Administrator | null> {
    const admin = await prisma.administrator.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    return admin ? Administrator.fromPrisma(admin) : null;
  }

  async save(admin: Administrator): Promise<Administrator> {
    const created = await prisma.administrator.create({
      data: {
        userId: admin.userId,
      },
      include: {
        user: true,
      },
    });

    return Administrator.fromPrisma(created);
  }

  async delete(userId: number): Promise<boolean> {
    try {
      await prisma.administrator.delete({
        where: { userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByUserId(userId: number): Promise<boolean> {
    const count = await prisma.administrator.count({
      where: { userId },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.administrator.count();
  }
}