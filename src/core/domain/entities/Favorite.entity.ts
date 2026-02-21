export class Favorite {
  constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly restaurantId: number,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(clientId: number, restaurantId: number): Favorite {
    if (!clientId || clientId <= 0) {
      throw new Error('El ID del cliente es inválido');
    }
    if (!restaurantId || restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }

    return new Favorite(0, clientId, restaurantId, new Date());
  }

  toJSON() {
    return {
      id: this.id,
      clientId: this.clientId,
      restaurantId: this.restaurantId,
      createdAt: this.createdAt,
    };
  }
}