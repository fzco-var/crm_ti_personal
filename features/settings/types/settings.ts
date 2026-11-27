export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Accent = "orange" | "blue" | "green" | "purple";
export type TimeZone =
  "America/Santiago" | "America/Punta_Arenas" | "Pacific/Easter" | "UTC";
export type DateFormat = "short" | "numeric" | "iso"; // 27 nov 2026 · 27-11-2026 · 2026-11-27
export type IdleTimeout = 15 | 30 | 60 | 240; // minutos

export interface Appearance {
  theme: ThemeMode;
  accent: Accent;
}

export interface RegionalSettings {
  timeZone: TimeZone;
  dateFormat: DateFormat;
}

export interface SecuritySettings {
  requireTwoFactor: boolean;
  minPasswordLength: string; // texto del campo; válido si es un entero de 8 a 15
  idleTimeoutMinutes: IdleTimeout;
}

export interface SettingsValues {
  appearance: Appearance;
  regional: RegionalSettings;
  security: SecuritySettings;
}
