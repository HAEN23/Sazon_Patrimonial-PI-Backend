/**
 * Tipos de usuario en el sistema
 * - ADMIN: Administrador del sistema
 * - RESTAURANT_OWNER: Dueño de restaurante (Restaurantero)
 * - CLIENT: Cliente/Usuario que puede dar likes y descargar menús
 */
export enum UserType {
  ADMIN = 'admin',
  RESTAURANT_OWNER = 'restaurantero',
  CLIENT = 'cliente',
}

// Helper functions
export const UserTypeLabels: Record<UserType, string> = {
  [UserType.ADMIN]: 'Administrador',
  [UserType.RESTAURANT_OWNER]: 'Restaurantero',
  [UserType.CLIENT]: 'Cliente',
};

export const getUserTypeLabel = (type: UserType): string => {
  return UserTypeLabels[type] || type;
};

export const isValidUserType = (type: string): type is UserType => {
  return Object.values(UserType).includes(type as UserType);
};

export const getAllUserTypes = (): UserType[] => {
  return Object.values(UserType);
};