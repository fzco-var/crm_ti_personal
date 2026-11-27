import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/features/settings/constants";
import type {
  DateFormat,
  SettingsValues,
} from "@/features/settings/types/settings";
import { formatDate } from "@/features/tickets/utils";

/** `today` como "2026-11-27" → "27 nov 2026", "27-11-2026" o "2026-11-27". */
export function formatDateExample(format: DateFormat, today: string) {
  if (format === "short") return formatDate(today);
  if (format === "iso") return today;
  const [year, month, day] = today.split("-");
  return `${day}-${month}-${year}`;
}

export type MinPasswordLengthError = "empty" | "outOfRange";

export const MIN_PASSWORD_LENGTH_ERRORS: Record<
  MinPasswordLengthError,
  string
> = {
  empty: "Indica el largo mínimo.",
  outOfRange: `Usa un número entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH}.`,
};

/** Válido si es un entero de 8 a 15, sin espacios ni decimales. */
export function getMinPasswordLengthError(
  text: string,
): MinPasswordLengthError | undefined {
  if (!text.trim()) return "empty";
  if (!/^\d+$/.test(text)) return "outOfRange";
  const length = Number(text);
  if (length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    return "outOfRange";
  }
  return undefined;
}

/** Campos cambiados respecto a `saved`, en el orden del aviso de cambios. */
export function getSettingsChanges(
  saved: SettingsValues,
  current: SettingsValues,
) {
  return {
    theme: saved.appearance.theme !== current.appearance.theme,
    accent: saved.appearance.accent !== current.appearance.accent,
    timeZone: saved.regional.timeZone !== current.regional.timeZone,
    dateFormat: saved.regional.dateFormat !== current.regional.dateFormat,
    requireTwoFactor:
      saved.security.requireTwoFactor !== current.security.requireTwoFactor,
    minPasswordLength:
      saved.security.minPasswordLength !== current.security.minPasswordLength,
    idleTimeoutMinutes:
      saved.security.idleTimeoutMinutes !== current.security.idleTimeoutMinutes,
  };
}

export type SettingsChanges = ReturnType<typeof getSettingsChanges>;

const CHANGE_NAMES: Record<keyof SettingsChanges, string> = {
  theme: "tema",
  accent: "acento",
  timeZone: "zona horaria",
  dateFormat: "formato de fecha",
  requireTwoFactor: "2FA obligatoria",
  minPasswordLength: "largo mínimo",
  idleTimeoutMinutes: "cierre por inactividad",
};

/** Nombres de los campos cambiados, en orden: "tema", "acento"… */
export function getChangeNames(changes: SettingsChanges) {
  return (Object.keys(CHANGE_NAMES) as (keyof SettingsChanges)[])
    .filter((key) => changes[key])
    .map((key) => CHANGE_NAMES[key]);
}
