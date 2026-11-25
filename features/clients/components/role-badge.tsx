import { CLIENT_ROLES, type Tone } from "@/features/clients/constants";
import type { ClientRole } from "@/features/clients/types/client";

export const TONE_CLASSES: Record<Tone, string> = {
  orange: "crm-badge-orange",
  blue: "crm-badge-blue",
  green: "crm-badge-green",
  gray: "crm-badge-gray",
};

export function RoleBadge({ role }: { role: ClientRole }) {
  const tone = CLIENT_ROLES.find(({ value }) => value === role)?.tone ?? "gray";

  return (
    <span className={`crm-badge ${TONE_CLASSES[tone]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {role}
    </span>
  );
}
