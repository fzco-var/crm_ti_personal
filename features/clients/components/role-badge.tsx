import { TONE_CLASSES } from "@/components/tone";
import { CLIENT_ROLES } from "@/features/clients/constants";
import type { ClientRole } from "@/features/clients/types/client";

export function RoleBadge({ role }: { role: ClientRole }) {
  const tone = CLIENT_ROLES.find(({ value }) => value === role)?.tone ?? "gray";

  return (
    <span className={`crm-badge ${TONE_CLASSES[tone]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {role}
    </span>
  );
}
