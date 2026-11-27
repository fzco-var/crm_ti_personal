import { TONE_CLASSES } from "@/components/tone";

// Cuenta: Activo en verde, Desactivado en gris.
export function UserStatusBadge({
  active,
  className = "",
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <span
      className={`crm-badge whitespace-nowrap ${TONE_CLASSES[active ? "green" : "gray"]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {active ? "Activo" : "Desactivado"}
    </span>
  );
}
