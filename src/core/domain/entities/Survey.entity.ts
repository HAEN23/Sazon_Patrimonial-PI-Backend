export class Survey {
  constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly restaurantId: number, // Asociado a un restaurante
    public question1?: string, // ¿Cómo calificarías la comida?
    public question2?: string, // ¿Qué te pareció el servicio?
    public question3?: string, // ¿Recomendarías este restaurante?
    public question4?: string, // ¿Qué te gustó más?
    public question5?: string, // ¿Qué mejorarías?
    public readonly createdAt: Date = new Date()
  ) {}

  static create(data: {
    clientId: number;
    restaurantId: number;
    question1?: string;
    question2?: string;
    question3?: string;
    question4?: string;
    question5?: string;
  }): Survey {
    if (!data.clientId || data.clientId <= 0) {
      throw new Error('El ID del cliente es inválido');
    }
    if (!data.restaurantId || data.restaurantId <= 0) {
      throw new Error('El ID del restaurante es inválido');
    }

    return new Survey(
      0,
      data.clientId,
      data.restaurantId,
      data.question1?.trim(),
      data.question2?.trim(),
      data.question3?.trim(),
      data.question4?.trim(),
      data.question5?.trim(),
      new Date()
    );
  }

  isComplete(): boolean {
    return !!(
      this.question1 &&
      this.question2 &&
      this.question3 &&
      this.question4 &&
      this.question5
    );
  }

  getAnsweredCount(): number {
    let count = 0;
    if (this.question1) count++;
    if (this.question2) count++;
    if (this.question3) count++;
    if (this.question4) count++;
    if (this.question5) count++;
    return count;
  }

  getCompletionPercentage(): number {
    return (this.getAnsweredCount() / 5) * 100;
  }

  toJSON() {
    return {
      id: this.id,
      clientId: this.clientId,
      restaurantId: this.restaurantId,
      question1: this.question1,
      question2: this.question2,
      question3: this.question3,
      question4: this.question4,
      question5: this.question5,
      createdAt: this.createdAt,
      isComplete: this.isComplete(),
      completionPercentage: this.getCompletionPercentage(),
    };
  }
}