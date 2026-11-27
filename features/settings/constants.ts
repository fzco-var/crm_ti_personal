import type { PillOption } from "@/components/pill-radio-group";
import type {
  Accent,
  Appearance,
  DateFormat,
  IdleTimeout,
  ThemeMode,
  TimeZone,
} from "@/features/settings/types/settings";

export const THEME_OPTIONS: PillOption<ThemeMode>[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export const ACCENT_OPTIONS: PillOption<Accent>[] = [
  { value: "orange", label: "Naranja", dotClassName: "bg-tone-orange-dot" },
  { value: "blue", label: "Azul", dotClassName: "bg-tone-blue-dot" },
  { value: "green", label: "Verde", dotClassName: "bg-tone-green-dot" },
  { value: "purple", label: "Morado", dotClassName: "bg-tone-purple-dot" },
];

export const TIME_ZONE_OPTIONS: { value: TimeZone; label: string }[] = [
  { value: "America/Santiago", label: "Chile continental (America/Santiago)" },
  {
    value: "America/Punta_Arenas",
    label: "Magallanes (America/Punta_Arenas)",
  },
  { value: "Pacific/Easter", label: "Isla de Pascua (Pacific/Easter)" },
  { value: "UTC", label: "UTC" },
];

// Las etiquetas son el ejemplo con la fecha de hoy; salen de `features/settings/utils`.
export const DATE_FORMAT_OPTIONS: DateFormat[] = ["short", "numeric", "iso"];

export const IDLE_TIMEOUT_OPTIONS: { value: IdleTimeout; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 h" },
  { value: 240, label: "4 h" },
];

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 15;

export const APPEARANCE_STORAGE_KEY = "crm:appearance:v1";

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "system",
  accent: "orange",
};
