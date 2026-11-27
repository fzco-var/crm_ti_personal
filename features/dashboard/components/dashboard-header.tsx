import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { QUICK_ACTIONS } from "@/features/dashboard/constants";
import { formatLongDate, getGreeting } from "@/features/dashboard/utils";

// Es la cuenta propia, como en el menú.
const USER_NAME = "Martín Vidal";

function getSummary(pendingCount: number) {
  if (pendingCount === 0) {
    return "Todo al día. Buen momento para avanzar en los proyectos.";
  }
  const things = pendingCount === 1 ? "1 cosa" : `${pendingCount} cosas`;
  return `Tienes ${things} que revisar. Lo más urgente está arriba.`;
}

export function DashboardHeader({
  today,
  hour,
  pendingCount,
}: {
  today: string;
  hour: number;
  pendingCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-compact text-ink-muted">
          {formatLongDate(today)}
        </span>
        <h1 className="crm-title">
          {getGreeting(hour)}, {USER_NAME}.
        </h1>
        <p className="text-field text-ink-soft">{getSummary(pendingCount)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, href, primary }) => (
          <Link
            key={href}
            href={href}
            className={`crm-btn ${primary ? "crm-btn-primary" : "crm-btn-secondary"}`}
          >
            <PlusIcon />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
