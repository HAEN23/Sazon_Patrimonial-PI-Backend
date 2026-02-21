/**
 * Estados posibles de un restaurante
 * - ACTIVE: Restaurante activo y visible
 * - INACTIVE: Restaurante inactivo, no visible
 * - SUSPENDED: Restaurante suspendido temporalmente
 */
export enum RestaurantStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
  SUSPENDED = 'suspendido',
}

// Helper functions
export const RestaurantStatusLabels: Record<RestaurantStatus, string> = {
  [RestaurantStatus.ACTIVE]: 'Activo',
  [RestaurantStatus.INACTIVE]: 'Inactivo',
  [RestaurantStatus.SUSPENDED]: 'Suspendido',
};

export const RestaurantStatusColors: Record<RestaurantStatus, string> = {
  [RestaurantStatus.ACTIVE]: 'green',
  [RestaurantStatus.INACTIVE]: 'gray',
  [RestaurantStatus.SUSPENDED]: 'red',
};

export const RestaurantStatusDescriptions: Record<RestaurantStatus, string> = {
  [RestaurantStatus.ACTIVE]: 'El restaurante está activo y visible para los clientes',
  [RestaurantStatus.INACTIVE]: 'El restaurante está inactivo y no es visible',
  [RestaurantStatus.SUSPENDED]: 'El restaurante ha sido suspendido temporalmente',
};

export const getRestaurantStatusLabel = (status: RestaurantStatus): string => {
  return RestaurantStatusLabels[status] || status;
};

export const getRestaurantStatusColor = (status: RestaurantStatus): string => {
  return RestaurantStatusColors[status] || 'gray';
};

export const getRestaurantStatusDescription = (status: RestaurantStatus): string => {
  return RestaurantStatusDescriptions[status] || '';
};

export const isValidRestaurantStatus = (status: string): status is RestaurantStatus => {
  return Object.values(RestaurantStatus).includes(status as RestaurantStatus);
};

export const isActiveRestaurant = (status: RestaurantStatus): boolean => {
  return status === RestaurantStatus.ACTIVE;
};

export const getAllRestaurantStatuses = (): RestaurantStatus[] => {
  return Object.values(RestaurantStatus);
};