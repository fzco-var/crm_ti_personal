import type { Tone } from "@/components/tone";

// Por fuerza, de 0 a 4. El nivel 0 es una contraseña vacía y no lleva tono.
export const PASSWORD_STRENGTH_LEVELS: { label: string; tone: Tone | null }[] =
  [
    { label: "Escribe una contraseña", tone: null },
    { label: "Débil", tone: "red" },
    { label: "Regular", tone: "amber" },
    { label: "Buena", tone: "blue" },
    { label: "Fuerte", tone: "green" },
  ];

export const PASSWORD_MIN_LENGTH = 12;

// Martín Vidal, el usuario con la sesión abierta.
export const CURRENT_USER_ID = "ce85bac2-92e3-40f4-9bbc-adda7d9a93b9";
