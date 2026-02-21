/**
 * Estados de una solicitud de registro de restaurante
 * - PENDING: Solicitud pendiente de revisión
 * - APPROVED: Solicitud aprobada
 * - REJECTED: Solicitud rechazada
 * - IN_REVIEW: Solicitud en proceso de revisión
 */
export enum ApplicationStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobado',
  REJECTED = 'rechazado',
  IN_REVIEW = 'en_revision',
}

// Helper functions
export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pendiente',
  [ApplicationStatus.APPROVED]: 'Aprobado',
  [ApplicationStatus.REJECTED]: 'Rechazado',
  [ApplicationStatus.IN_REVIEW]: 'En Revisión',
};

export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'yellow',
  [ApplicationStatus.APPROVED]: 'green',
  [ApplicationStatus.REJECTED]: 'red',
  [ApplicationStatus.IN_REVIEW]: 'blue',
};

export const ApplicationStatusIcons: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '⏳',
  [ApplicationStatus.APPROVED]: '✅',
  [ApplicationStatus.REJECTED]: '❌',
  [ApplicationStatus.IN_REVIEW]: '🔍',
};

export const ApplicationStatusDescriptions: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Tu solicitud está pendiente de revisión',
  [ApplicationStatus.APPROVED]: 'Tu solicitud ha sido aprobada',
  [ApplicationStatus.REJECTED]: 'Tu solicitud ha sido rechazada',
  [ApplicationStatus.IN_REVIEW]: 'Tu solicitud está siendo revisada por un administrador',
};

export const getApplicationStatusLabel = (status: ApplicationStatus): string => {
  return ApplicationStatusLabels[status] || status;
};

export const getApplicationStatusColor = (status: ApplicationStatus): string => {
  return ApplicationStatusColors[status] || 'gray';
};

export const getApplicationStatusIcon = (status: ApplicationStatus): string => {
  return ApplicationStatusIcons[status] || '📋';
};

export const getApplicationStatusDescription = (status: ApplicationStatus): string => {
  return ApplicationStatusDescriptions[status] || '';
};

export const isValidApplicationStatus = (status: string): status is ApplicationStatus => {
  return Object.values(ApplicationStatus).includes(status as ApplicationStatus);
};

export const isPendingApplication = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.PENDING;
};

export const isApprovedApplication = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.APPROVED;
};

export const isRejectedApplication = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.REJECTED;
};

export const canEditApplication = (status: ApplicationStatus): boolean => {
  return status === ApplicationStatus.PENDING || status === ApplicationStatus.REJECTED;
};

export const getAllApplicationStatuses = (): ApplicationStatus[] => {
  return Object.values(ApplicationStatus);
};