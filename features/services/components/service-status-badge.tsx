import { TONE_CLASSES } from "@/components/tone";
import { SERVICE_STATUS_TONES } from "@/features/services/constants";
import type { ServiceStatus } from "@/features/services/types/service";

export function ServiceStatusBadge({
  status,
  className = "",
}: {
  status: ServiceStatus;
  className?: string;
}) {
  return (
    <span
      className={`crm-badge whitespace-nowrap ${TONE_CLASSES[SERVICE_STATUS_TONES[status]]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
