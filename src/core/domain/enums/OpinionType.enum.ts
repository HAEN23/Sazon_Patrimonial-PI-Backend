/**
 * Razones por las cuales un usuario descarga el menú
 * (Encuesta opcional para estadísticas)
 * - FOOD: Interesado en la comida
 * - LOCATION: Por la ubicación
 * - RECOMMENDATION: Por recomendación
 * - SCHEDULE: Por el horario
 * - VIEW: Por la vista del lugar
 */
export enum OpinionType {
  FOOD = 'La comida',
  LOCATION = 'La ubicacion',
  RECOMMENDATION = 'Recomendacion',
  SCHEDULE = 'El horario',
  VIEW = 'La vista',
}

// Helper functions
export const OpinionTypeLabels: Record<OpinionType, string> = {
  [OpinionType.FOOD]: 'La comida',
  [OpinionType.LOCATION]: 'La ubicación',
  [OpinionType.RECOMMENDATION]: 'Recomendación',
  [OpinionType.SCHEDULE]: 'El horario',
  [OpinionType.VIEW]: 'La vista',
};

export const OpinionTypeIcons: Record<OpinionType, string> = {
  [OpinionType.FOOD]: '🍽️',
  [OpinionType.LOCATION]: '📍',
  [OpinionType.RECOMMENDATION]: '👥',
  [OpinionType.SCHEDULE]: '🕒',
  [OpinionType.VIEW]: '🌅',
};

export const OpinionTypeDescriptions: Record<OpinionType, string> = {
  [OpinionType.FOOD]: 'Me interesa probar la comida',
  [OpinionType.LOCATION]: 'La ubicación me parece conveniente',
  [OpinionType.RECOMMENDATION]: 'Me lo recomendaron',
  [OpinionType.SCHEDULE]: 'El horario se ajusta a mis necesidades',
  [OpinionType.VIEW]: 'Me gusta la vista del lugar',
};

export const getOpinionTypeLabel = (opinion: OpinionType): string => {
  return OpinionTypeLabels[opinion] || opinion;
};

export const getOpinionTypeIcon = (opinion: OpinionType): string => {
  return OpinionTypeIcons[opinion] || '💭';
};

export const getOpinionTypeDescription = (opinion: OpinionType): string => {
  return OpinionTypeDescriptions[opinion] || '';
};

export const isValidOpinionType = (opinion: string): opinion is OpinionType => {
  return Object.values(OpinionType).includes(opinion as OpinionType);
};

export const getAllOpinionTypes = (): OpinionType[] => {
  return Object.values(OpinionType);
};

// Para encuestas
export const getOpinionTypesForSurvey = (): Array<{ value: OpinionType; label: string; icon: string }> => {
  return getAllOpinionTypes().map(type => ({
    value: type,
    label: getOpinionTypeLabel(type),
    icon: getOpinionTypeIcon(type),
  }));
};