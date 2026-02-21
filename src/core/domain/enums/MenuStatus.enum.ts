/**
 * Estados posibles de un menú
 * - ACTIVE: Menú activo y disponible para descarga
 * - INACTIVE: Menú inactivo, no visible para clientes
 * - PENDING: Menú pendiente de aprobación
 * - REVISION: Menú en revisión por administrador
 */
export enum MenuStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
  PENDING = 'pendiente',
  REVISION = 'revision',
}

// Helper functions
export const MenuStatusLabels: Record<MenuStatus, string> = {
  [MenuStatus.ACTIVE]: 'Activo',
  [MenuStatus.INACTIVE]: 'Inactivo',
  [MenuStatus.PENDING]: 'Pendiente',
  [MenuStatus.REVISION]: 'En Revisión',
};

export const MenuStatusColors: Record<MenuStatus, string> = {
  [MenuStatus.ACTIVE]: 'green',
  [MenuStatus.INACTIVE]: 'gray',
  [MenuStatus.PENDING]: 'yellow',
  [MenuStatus.REVISION]: 'orange',
};

export const getMenuStatusLabel = (status: MenuStatus): string => {
  return MenuStatusLabels[status] || status;
};

export const getMenuStatusColor = (status: MenuStatus): string => {
  return MenuStatusColors[status] || 'gray';
};

export const isValidMenuStatus = (status: string): status is MenuStatus => {
  return Object.values(MenuStatus).includes(status as MenuStatus);
};

export const isActiveMenu = (status: MenuStatus): boolean => {
  return status === MenuStatus.ACTIVE;
};

export const getAllMenuStatuses = (): MenuStatus[] => {
  return Object.values(MenuStatus);
};