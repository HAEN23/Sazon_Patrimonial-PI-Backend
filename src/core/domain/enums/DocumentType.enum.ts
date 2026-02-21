/**
 * Tipos de documentos que puede subir un restaurantero
 * - PROOF_OF_ADDRESS: Comprobante de domicilio
 * - RESTAURANT_MENU: Menú del restaurante
 * - OPERATING_LICENSE: Licencia de funcionamiento
 * - HEALTH_PERMIT: Permiso de sanidad
 * - FOOD_HANDLING_CERTIFICATE: Certificado de manipulación de alimentos
 * - TAX_ID: RFC (Registro Federal de Contribuyentes)
 * - OTHER: Otro tipo de documento
 */
export enum DocumentType {
  PROOF_OF_ADDRESS = 'comprobante_domicilio',
  RESTAURANT_MENU = 'menu_restaurante',
  OPERATING_LICENSE = 'licencia_funcionamiento',
  HEALTH_PERMIT = 'permiso_sanidad',
  FOOD_HANDLING_CERTIFICATE = 'certificado_manipulacion',
  TAX_ID = 'rfc',
  OTHER = 'otro',
}

// Helper functions
export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.PROOF_OF_ADDRESS]: 'Comprobante de Domicilio',
  [DocumentType.RESTAURANT_MENU]: 'Menú del Restaurante',
  [DocumentType.OPERATING_LICENSE]: 'Licencia de Funcionamiento',
  [DocumentType.HEALTH_PERMIT]: 'Permiso de Sanidad',
  [DocumentType.FOOD_HANDLING_CERTIFICATE]: 'Certificado de Manipulación de Alimentos',
  [DocumentType.TAX_ID]: 'RFC',
  [DocumentType.OTHER]: 'Otro',
};

export const DocumentTypeDescriptions: Record<DocumentType, string> = {
  [DocumentType.PROOF_OF_ADDRESS]: 'Documento que acredita el domicilio del restaurante',
  [DocumentType.RESTAURANT_MENU]: 'Menú oficial del restaurante',
  [DocumentType.OPERATING_LICENSE]: 'Licencia oficial para operar el negocio',
  [DocumentType.HEALTH_PERMIT]: 'Permiso de sanidad e higiene',
  [DocumentType.FOOD_HANDLING_CERTIFICATE]: 'Certificado de manipulación higiénica de alimentos',
  [DocumentType.TAX_ID]: 'Registro Federal de Contribuyentes',
  [DocumentType.OTHER]: 'Otro tipo de documento',
};

export const DocumentTypeIcons: Record<DocumentType, string> = {
  [DocumentType.PROOF_OF_ADDRESS]: '🏠',
  [DocumentType.RESTAURANT_MENU]: '📋',
  [DocumentType.OPERATING_LICENSE]: '📜',
  [DocumentType.HEALTH_PERMIT]: '🏥',
  [DocumentType.FOOD_HANDLING_CERTIFICATE]: '👨‍🍳',
  [DocumentType.TAX_ID]: '💼',
  [DocumentType.OTHER]: '📄',
};

export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DocumentTypeLabels[type] || type;
};

export const getDocumentTypeDescription = (type: DocumentType): string => {
  return DocumentTypeDescriptions[type] || '';
};

export const getDocumentTypeIcon = (type: DocumentType): string => {
  return DocumentTypeIcons[type] || '📄';
};

export const isValidDocumentType = (type: string): type is DocumentType => {
  return Object.values(DocumentType).includes(type as DocumentType);
};

export const getAllDocumentTypes = (): DocumentType[] => {
  return Object.values(DocumentType);
};

// Documentos requeridos para registro
export const getRequiredDocumentTypes = (): DocumentType[] => {
  return [
    DocumentType.PROOF_OF_ADDRESS,
    DocumentType.OPERATING_LICENSE,
    DocumentType.HEALTH_PERMIT,
    DocumentType.TAX_ID,
  ];
};

export const isRequiredDocument = (type: DocumentType): boolean => {
  return getRequiredDocumentTypes().includes(type);
};