import { z } from 'zod';
import { DownloadOrigin } from '@/core/domain/enums/DownloadOrigin.enum';
import { OpinionType } from '@/core/domain/enums/OpinionType.enum';

/**
 * DTO para registrar descarga
 */
export const TrackDownloadDtoSchema = z.object({
  ownerId: z.number()
    .int({ message: 'El ID del propietario debe ser un número entero' })
    .positive({ message: 'El ID del propietario debe ser positivo' }),
  applicationId: z.number()
    .int({ message: 'El ID de solicitud debe ser un número entero' })
    .positive({ message: 'El ID de solicitud debe ser positivo' }),

  origin: z.nativeEnum(DownloadOrigin),
  opinion: z.nativeEnum(OpinionType),
});

export type TrackDownloadDto = z.infer<typeof TrackDownloadDtoSchema>;

export const validateTrackDownloadDto = (data: unknown): TrackDownloadDto => {
  try {
    return TrackDownloadDtoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const customErrors = error.issues.map((err) => {
        if (err.path.includes('origin') && (err.code as string) === 'invalid_enum_value') {
          return { ...err, message: 'Origen de descarga inválido' };
        }
        if (err.path.includes('opinion') && (err.code as string) === 'invalid_enum_value') {
          return { ...err, message: 'Tipo de opinión inválido' };
        }
        return err;
      });
      throw new z.ZodError(customErrors);
    }
    throw error;
  }
};