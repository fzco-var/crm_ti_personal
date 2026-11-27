// Sufijo de las clases `crm-badge-*`.
export type Tone =
  "orange" | "blue" | "amber" | "green" | "gray" | "red" | "purple";

export const TONE_CLASSES: Record<Tone, string> = {
  orange: "crm-badge-orange",
  blue: "crm-badge-blue",
  amber: "crm-badge-amber",
  green: "crm-badge-green",
  gray: "crm-badge-gray",
  red: "crm-badge-red",
  purple: "crm-badge-purple",
};

// Puntos de color fuera de una etiqueta: prioridad, resumen, botones rápidos.
export const TONE_DOT_CLASSES: Record<Tone, string> = {
  orange: "bg-tone-orange-dot",
  blue: "bg-tone-blue-dot",
  amber: "bg-tone-amber-dot",
  green: "bg-tone-green-dot",
  gray: "bg-tone-gray-dot",
  red: "bg-tone-red-dot",
  purple: "bg-tone-purple-dot",
};
