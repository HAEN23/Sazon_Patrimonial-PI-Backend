export class Zone {
  constructor(
    public readonly id: number,
    public name: string,
    public readonly ownerId: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(data: { name: string; ownerId: number }): Zone {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('El nombre de la zona debe tener al menos 3 caracteres');
    }
    if (!data.ownerId || data.ownerId <= 0) {
      throw new Error('El ID del propietario es inválido');
    }

    return new Zone(0, data.name.trim(), data.ownerId, new Date(), new Date());
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new Error('El nombre de la zona debe tener al menos 3 caracteres');
    }
    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}