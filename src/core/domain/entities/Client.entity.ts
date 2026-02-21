export class Client {
  constructor(
    public readonly userId: number,
    public phone?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(userId: number, phone?: string): Client {
    if (!userId || userId <= 0) {
      throw new Error('El ID de usuario es inválido');
    }

    // Validar teléfono si se proporciona
    if (phone) {
      const cleaned = phone.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleaned)) {
        throw new Error('El teléfono debe tener 10 dígitos');
      }
    }

    return new Client(userId, phone, new Date(), new Date());
  }

  updatePhone(newPhone?: string): void {
    if (newPhone) {
      const cleaned = newPhone.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleaned)) {
        throw new Error('El teléfono debe tener 10 dígitos');
      }
      this.phone = cleaned;
    } else {
      this.phone = undefined;
    }
    this.updatedAt = new Date();
  }

  hasPhone(): boolean {
    return !!this.phone;
  }

  toJSON() {
    return {
      userId: this.userId,
      phone: this.phone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}