import { TONE_CLASSES } from "@/components/tone";
import type { Role } from "@/features/users/types/role";
import { getRoleTone } from "@/features/users/utils";

export function RoleBadge({
  role,
  className = "",
}: {
  role: Pick<Role, "key" | "name">;
  className?: string;
}) {
  return (
    <span
      className={`crm-badge whitespace-nowrap ${TONE_CLASSES[getRoleTone(role)]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {role.name}
    </span>
  );
}
