export type ProjectStatus =
  "Planificado" | "En curso" | "En pausa" | "Completado";

export interface Project {
  id: string; // UUID
  code: string; // "PRJ-021"
  name: string;
  clientId: string; // contacto principal, en data/clients.ts
  status: ProjectStatus;
  endInDays: number; // desfase respecto a hoy
}
