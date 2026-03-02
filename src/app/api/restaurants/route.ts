import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/core/infrastructure/http/middleware/error.middleware';
import { validateBody, validateQuery } from '@/core/infrastructure/http/middleware/validation.middleware';
import { authMiddleware } from '@/core/infrastructure/http/middleware/auth.middleware';
import { createRestaurantSchema, searchRestaurantsSchema } from '@/core/infrastructure/http/validators/restaurant.validator';
import { GetAllRestaurantsUseCase } from '@/core/application/use-cases/restaurants/GetAllRestaurants.usecase';
import { CreateRestaurantUseCase } from '@/core/application/use-cases/restaurants/CreateRestaurant.usecase';
import { PrismaRestaurantRepository } from '@/core/infrastructure/database/repositories/PrismaRestaurantRepository';
import { PrismaApplicationRepository } from '@/core/infrastructure/database/repositories/PrismaApplicationRepository';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const filters = validateQuery(request, searchRestaurantsSchema);

    const restaurantRepository = new PrismaRestaurantRepository();
    const useCase = new GetAllRestaurantsUseCase(restaurantRepository);

    const result = await useCase.execute(filters);

    return NextResponse.json({
      success: true,
      data: result.restaurants,
      total: result.total,
    });
  })(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await authMiddleware(request);
    const body = await validateBody(request, createRestaurantSchema);

    const restaurantRepository = new PrismaRestaurantRepository();
    const applicationRepository = new PrismaApplicationRepository();

    const useCase = new CreateRestaurantUseCase(
      restaurantRepository,
      applicationRepository
    );

    const result = await useCase.execute({
      ...body,
      ownerId: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  })(request);
}