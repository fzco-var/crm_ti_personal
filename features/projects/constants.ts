import type { Tone } from "@/components/tone";
import type {
  ProjectPriority,
  ProjectStatus,
} from "@/features/projects/types/project";

export const PROJECT_STATUS_TONES: Record<ProjectStatus, Tone> = {
  Planificado: "gray",
  "En curso": "blue",
  "En pausa": "amber",
  Completado: "green",
};

// Para el punto de color: `--color-tone-<tono>-dot`.
export const PROJECT_PRIORITIES: { value: ProjectPriority; tone: Tone }[] = [
  { value: "Baja", tone: "gray" },
  { value: "Media", tone: "blue" },
  { value: "Alta", tone: "red" },
];
