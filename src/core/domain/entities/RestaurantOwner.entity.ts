export class RestaurantOwner {
  constructor(
    public readonly userId: number,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(userId: number): RestaurantOwner {
    if (!userId || userId <= 0) {
      throw new Error('El ID de usuario es inválido');
    }
    return new RestaurantOwner(userId, new Date());
  }

  static fromPrisma(prismaOwner: any): RestaurantOwner {
    return new RestaurantOwner(
      prismaOwner.userId,
      new Date(prismaOwner.createdAt)
    );
  }

  toJSON() {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}