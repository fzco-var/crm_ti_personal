export type ProjectStatus =
  "Planificado" | "En curso" | "En pausa" | "Completado";
export type ProjectPriority = "Baja" | "Media" | "Alta";

export interface ProjectMilestone {
  name: string;
  dueInDays: number; // desfase respecto a hoy
  done: boolean;
}

export interface ProjectHistoryEntry {
  text: string; // "Hito «MVP» completado"
  daysAgo: number; // 0 se muestra como "ahora"
}

export interface Project {
  id: string; // UUID
  code: string; // "PRJ-021"
  name: string;
  clientId: string; // contacto principal, en data/clients.ts
  description: string; // puede ser ""
  status: ProjectStatus;
  priority: ProjectPriority;
  startInDays: number; // desfase respecto a hoy
  endInDays: number;
  createdDaysAgo: number;
  milestones: ProjectMilestone[]; // en orden de fecha
  history: ProjectHistoryEntry[]; // de la más reciente a la más antigua
}

export interface MilestoneFormValues {
  key: string; // estable mientras se edita
  name: string;
  date: string; // "2026-11-26" o ""
  done: boolean;
}

// Valores editables; el alta admite `clientId` y `endDate` vacíos.
export interface ProjectFormValues {
  name: string;
  clientId: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  milestones: MilestoneFormValues[];
}
