import type { Tone } from "@/components/tone";
import type { ProjectStatus } from "@/features/projects/types/project";

export const PROJECT_STATUS_TONES: Record<ProjectStatus, Tone> = {
  Planificado: "gray",
  "En curso": "blue",
  "En pausa": "amber",
  Completado: "green",
};
