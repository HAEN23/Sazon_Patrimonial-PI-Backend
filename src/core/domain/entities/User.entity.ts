import { UserType } from '../enums/UserType.enum';
import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: Email,
    public password: Password,
    public type: UserType,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: {
    name: string;
    email: string;
    password: string;
    type: UserType;
  }): User {
    return new User(
      0, // Will be set by database
      data.name.trim(),
      new Email(data.email),
      new Password(data.password),
      data.type,
      new Date(),
      new Date()
    );
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  updateEmail(newEmail: string): void {
    this.email = new Email(newEmail);
    this.updatedAt = new Date();
  }

  updatePassword(newPassword: Password): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.type === UserType.ADMIN;
  }

  isRestaurantOwner(): boolean {
    return this.type === UserType.RESTAURANT_OWNER;
  }

  isClient(): boolean {
    return this.type === UserType.CLIENT;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email.getValue(),
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}