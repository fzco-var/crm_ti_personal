import type { SettingsValues } from "@/features/settings/types/settings";

// La apariencia no está aquí: se guarda en el navegador (`localStorage`).
export const defaultSettings: Omit<SettingsValues, "appearance"> = {
  regional: {
    timeZone: "America/Santiago",
    dateFormat: "short",
  },
  security: {
    requireTwoFactor: true,
    minPasswordLength: "8",
    idleTimeoutMinutes: 30,
  },
};
