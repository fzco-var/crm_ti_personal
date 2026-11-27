export interface UserSession {
  device: string; // "Chrome · macOS"
  ip: string;
  lastSeenDaysAgo: number; // 0 es "activa ahora"
}

export interface UserActivity {
  text: string; // "Inició sesión"
  daysAgo: number;
}

export interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  username: string; // sin "@"
  email: string;
  roleId: string; // en data/roles.ts
  active: boolean;
  passwordTemporary: boolean;
  passwordChangedDaysAgo: number;
  twoFactorActive: boolean; // false es "Pendiente"
  sessions: UserSession[];
  activity: UserActivity[]; // de la más reciente a la más antigua
  createdDaysAgo: number;
  lastAccessDaysAgo: number | null; // null es "nunca"
}

// Valores editables; el alta admite `roleId` vacío.
export interface UserFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: string;
}

export interface UserCreateValues extends UserFormValues {
  password: string;
  forcePasswordChange: boolean;
}
