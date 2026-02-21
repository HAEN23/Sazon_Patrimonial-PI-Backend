import { Document } from '../entities/Document.entity';
import { DocumentType } from '../enums/DocumentType.enum';

/**
 * Interface para el repositorio de documentos
 */
export interface IDocumentRepository {
  /**
   * Obtener todos los documentos
   */
  findAll(): Promise<Document[]>;

  /**
   * Buscar documento por ID
   */
  findById(id: number): Promise<Document | null>;

  /**
   * Buscar documentos por restaurante
   */
  findByRestaurantId(restaurantId: number): Promise<Document[]>;

  /**
   * Buscar documentos por propietario
   */
  findByOwnerId(ownerId: number): Promise<Document[]>;

  /**
   * Buscar documentos por tipo
   */
  findByType(type: DocumentType): Promise<Document[]>;

  /**
   * Buscar documentos por solicitud
   */
  findByApplicationId(applicationId: number): Promise<Document[]>;

  /**
   * Guardar un nuevo documento
   */
  save(document: Document): Promise<Document>;

  /**
   * Eliminar un documento
   */
  delete(id: number): Promise<boolean>;

  /**
   * Contar documentos de un restaurante
   */
  countByRestaurant(restaurantId: number): Promise<number>;

  /**
   * Verificar si existen todos los documentos requeridos
   */
  hasAllRequiredDocuments(restaurantId: number): Promise<boolean>;
}