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

  toJSON() {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }
}