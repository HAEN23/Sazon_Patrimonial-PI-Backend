export class Administrator {
  constructor(
    public readonly userId: number,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(userId: number): Administrator {
    if (!userId || userId <= 0) {
      throw new Error('El ID de usuario es inválido');
    }
    return new Administrator(userId, new Date());
  }

  static fromPrisma(prismaAdmin: any): Administrator {
    return new Administrator(
      prismaAdmin.userId,
      new Date(prismaAdmin.createdAt)
    );
  }

  toJSON() {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}