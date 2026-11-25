import type { Tone } from "@/components/tone";
import type {
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/features/tickets/types/ticket";

// En el orden en que se ordenan y se muestran.
export const TICKET_STATUSES: TicketStatus[] = [
  "Abierto",
  "En curso",
  "En espera",
  "Cerrado",
];

export const TICKET_STATUS_TONES: Record<TicketStatus, Tone> = {
  Abierto: "orange",
  "En curso": "blue",
  "En espera": "amber",
  Cerrado: "gray",
};

export const TICKET_TYPES: TicketType[] = [
  "Bug",
  "Mejora",
  "Cambio",
  "Consulta",
];

// Para el punto de color: `--color-tone-<tono>-dot`.
export const TICKET_PRIORITIES: { value: TicketPriority; tone: Tone }[] = [
  { value: "Baja", tone: "gray" },
  { value: "Media", tone: "blue" },
  { value: "Alta", tone: "amber" },
  { value: "Urgente", tone: "red" },
];
