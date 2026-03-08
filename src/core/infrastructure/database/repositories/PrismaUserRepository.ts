import { prisma } from '../prisma-client';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';

export class PrismaUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const users = await prisma.usuario.findMany({
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return users.map((user: any) => User.fromPrisma({
      id: user.id_usuario,
      name: user.nombre,
      email: user.correo,
      password: user.contrasena,
      type: user.tipo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      ...user
    }));
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return user ? User.fromPrisma({
      id: user.id_usuario,
      name: user.nombre,
      email: user.correo,
      password: user.contrasena,
      type: user.tipo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      ...user
    }) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.usuario.findUnique({
      where: { correo: email },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return user ? User.fromPrisma({
      id: user.id_usuario,
      name: user.nombre,
      email: user.correo,
      password: user.contrasena,
      type: user.tipo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      ...user
    }) : null;
  }

  async findByType(type: string): Promise<User[]> {
    const users = await prisma.usuario.findMany({
      where: { tipo: type },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return users.map((user: any) => User.fromPrisma({
      id: user.id_usuario,
      name: user.nombre,
      email: user.correo,
      password: user.contrasena,
      type: user.tipo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      ...user
    }));
  }

  async save(user: User): Promise<User> {
    const created = await prisma.usuario.create({
      data: {
        nombre: user.name,
        correo: user.email.getValue(),
        contrasena: user.password.getValue(),
        tipo: user.type,
        id_rol: 1, // Default role, adjust as needed
      },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return User.fromPrisma({
      id: created.id_usuario,
      name: created.nombre,
      email: created.correo,
      password: created.contrasena,
      type: created.tipo,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      ...created
    });
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.usuario.update({
      where: { id_usuario: user.id },
      data: {
        nombre: user.name,
        correo: user.email.getValue(),
        contrasena: user.password.getValue(),
        tipo: user.type,
      },
      include: {
        administrator: true,
        restaurantOwner: true,
        client: true,
      },
    });

    return User.fromPrisma({
      id: updated.id_usuario,
      name: updated.nombre,
      email: updated.correo,
      password: updated.contrasena,
      type: updated.tipo,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      ...updated
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.usuario.delete({
        where: { id_usuario: id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.usuario.count({
      where: { correo: email },
    });

    return count > 0;
  }

  async count(): Promise<number> {
    return await prisma.usuario.count();
  }

  async countByType(type: string): Promise<number> {
    return await prisma.usuario.count({
      where: { tipo: type },
    });
  }
}