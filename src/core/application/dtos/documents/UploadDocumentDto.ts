import { z } from 'zod';
import { DocumentType } from '@/core/domain/enums/DocumentType.enum';

/**
 * DTO para subir documento
 */
export const UploadDocumentDtoSchema = z.object({
  filename: z.string()
    .min(1, 'El nombre del archivo es requerido'),

  type: z.nativeEnum(DocumentType),
  
  restaurantId: z.number()
    .int('El ID del restaurante debe ser un entero')
    .positive('El ID del restaurante debe ser positivo'),
  
  applicationId: z.number()
    .int('El ID de solicitud debe ser un entero')
    .positive('El ID de solicitud debe ser positivo'),
  
  ownerId: z.number()
    .int('El ID del propietario debe ser un entero')
    .positive('El ID del propietario debe ser positivo'),
});

export type UploadDocumentDto = z.infer<typeof UploadDocumentDtoSchema>;

export const validateUploadDocumentDto = (data: unknown): UploadDocumentDto => {
  return UploadDocumentDtoSchema.parse(data);
};