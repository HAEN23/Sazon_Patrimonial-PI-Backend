import { z } from 'zod';

/**
 * DTO para enviar encuesta
 */
export const SubmitSurveyDtoSchema = z.object({
  clientId: z.number()
    .int({ message: 'El ID del cliente es requerido y debe ser un número entero' })
    .positive({ message: 'El ID del cliente debe ser positivo' }),
  restaurantId: z.number()
    .int({ message: 'El ID del restaurante es requerido y debe ser un número entero' })
    .positive({ message: 'El ID del restaurante debe ser positivo' }),
  question1: z.string().max(500).optional(),
  question2: z.string().max(500).optional(),
  question3: z.string().max(500).optional(),
  question4: z.string().max(500).optional(),
  question5: z.string().max(500).optional(),
});

export type SubmitSurveyDto = z.infer<typeof SubmitSurveyDtoSchema>;

export const validateSubmitSurveyDto = (data: unknown): SubmitSurveyDto => {
  return SubmitSurveyDtoSchema.parse(data);
};