import { TONE_CLASSES } from "@/components/tone";
import { PROJECT_STATUS_TONES } from "@/features/projects/constants";
import type { ProjectStatus } from "@/features/projects/types/project";

export function ProjectStatusBadge({
  status,
  className = "",
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={`crm-badge ${TONE_CLASSES[PROJECT_STATUS_TONES[status]]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
