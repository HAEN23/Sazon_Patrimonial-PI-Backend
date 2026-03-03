import { prisma } from '../prisma-client';
import { ISurveyRepository } from '@/core/domain/repositories/ISurveyRepository';
import { Survey } from '@/core/domain/entities/Survey.entity';

export class PrismaSurveyRepository implements ISurveyRepository {
  async findAll(): Promise<Survey[]> {
    const surveys = await prisma.survey.findMany({
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return surveys.map((survey: any) => Survey.fromPrisma(survey));
  }

  async findById(id: number): Promise<Survey | null> {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return survey ? Survey.fromPrisma(survey) : null;
  }

  async findByClientId(clientId: number): Promise<Survey[]> {
    const surveys = await prisma.survey.findMany({
      where: { clientId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return surveys.map((survey: any) => Survey.fromPrisma(survey));
  }

  async findByRestaurantId(restaurantId: number): Promise<Survey[]> {
    const surveys = await prisma.survey.findMany({
      where: { restaurantId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return surveys.map((survey: any) => Survey.fromPrisma(survey));
  }

  async save(survey: Survey): Promise<Survey> {
    const created = await prisma.survey.create({
      data: {
        clientId: survey.clientId,
        restaurantId: survey.restaurantId,
        question1: survey.question1,
        question2: survey.question2,
        question3: survey.question3,
        question4: survey.question4,
        question5: survey.question5,
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
    });

    return Survey.fromPrisma(created);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.survey.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByClientId(clientId: number): Promise<boolean> {
    const count = await prisma.survey.count({
      where: { clientId },
    });
    return count > 0;
  }

  async existsByClientAndRestaurant(
    clientId: number,
    restaurantId: number
  ): Promise<boolean> {
    const count = await prisma.survey.count({
      where: {
        clientId,
        restaurantId,
      },
    });
    return count > 0;
  }

  async countCompleted(): Promise<number> {
    const surveys = await prisma.survey.findMany();
    return surveys.filter(
      (s: any) =>
        s.question1 &&
        s.question2 &&
        s.question3 &&
        s.question4 &&
        s.question5
    ).length;
  }

  async countByRestaurant(restaurantId: number): Promise<number> {
    return await prisma.survey.count({
      where: { restaurantId },
    });
  }

  async findRecent(limit: number): Promise<Survey[]> {
    const surveys = await prisma.survey.findMany({
      take: limit,
      include: {
        client: {
          include: {
            user: true,
          },
        },
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return surveys.map((survey: any) => Survey.fromPrisma(survey));
  }
}