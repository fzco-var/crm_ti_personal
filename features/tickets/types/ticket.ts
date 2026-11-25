export type TicketStatus = "Abierto" | "En curso" | "En espera" | "Cerrado";
export type TicketType = "Bug" | "Mejora" | "Cambio" | "Consulta";
export type TicketPriority = "Baja" | "Media" | "Alta" | "Urgente";

export interface TicketActivity {
  author: string;
  initials: string;
  isOwn: boolean; // la escribió el usuario del CRM
  action: string;
  hoursAgo: number;
  text: string; // puede ser ""
}

export interface Ticket {
  id: string; // UUID
  code: string; // "#T-1048"
  title: string;
  type: TicketType;
  description: string;
  projectId: string; // UUID de un proyecto
  requesterId: string | null; // UUID de un cliente; null es "Yo"
  status: TicketStatus;
  priority: TicketPriority;
  dueInDays: number | null; // desfase respecto a hoy
  waitingFor: string;
  activity: TicketActivity[]; // de la más reciente a la más antigua
}

// Valores editables; el alta admite `projectId` vacío.
export interface TicketFormValues {
  title: string;
  type: TicketType;
  description: string;
  projectId: string;
  requesterId: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  dueDate: string; // "2026-11-26" o ""
  waitingFor: string;
  resolution: string;
}
