/**
 * Origen del usuario que descarga el menú
 * - NATIONAL: Usuario nacional (México)
 * - FOREIGN: Usuario extranjero
 */
export enum DownloadOrigin {
  NATIONAL = 'Nacional',
  FOREIGN = 'Extranjero',
}

// Helper functions
export const DownloadOriginLabels: Record<DownloadOrigin, string> = {
  [DownloadOrigin.NATIONAL]: 'Nacional',
  [DownloadOrigin.FOREIGN]: 'Extranjero',
};

export const DownloadOriginIcons: Record<DownloadOrigin, string> = {
  [DownloadOrigin.NATIONAL]: '🇲🇽',
  [DownloadOrigin.FOREIGN]: '🌍',
};

export const DownloadOriginColors: Record<DownloadOrigin, string> = {
  [DownloadOrigin.NATIONAL]: 'green',
  [DownloadOrigin.FOREIGN]: 'blue',
};

export const getDownloadOriginLabel = (origin: DownloadOrigin): string => {
  return DownloadOriginLabels[origin] || origin;
};

export const getDownloadOriginIcon = (origin: DownloadOrigin): string => {
  return DownloadOriginIcons[origin] || '🌍';
};

export const getDownloadOriginColor = (origin: DownloadOrigin): string => {
  return DownloadOriginColors[origin] || 'gray';
};

export const isValidDownloadOrigin = (origin: string): origin is DownloadOrigin => {
  return Object.values(DownloadOrigin).includes(origin as DownloadOrigin);
};

export const isNationalDownload = (origin: DownloadOrigin): boolean => {
  return origin === DownloadOrigin.NATIONAL;
};

export const isForeignDownload = (origin: DownloadOrigin): boolean => {
  return origin === DownloadOrigin.FOREIGN;
};

export const getAllDownloadOrigins = (): DownloadOrigin[] => {
  return Object.values(DownloadOrigin);
};