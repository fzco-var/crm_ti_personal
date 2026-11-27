"use client";

import Link from "next/link";
import { useId } from "react";
import { ClockIcon, MoneyIcon, WarningIcon } from "@/components/icons";
import type {
  AttentionItem,
  AttentionKind,
} from "@/features/dashboard/types/dashboard";

const KIND_ICONS: Record<
  AttentionKind,
  { Icon: typeof WarningIcon; className: string }
> = {
  critical: { Icon: WarningIcon, className: "bg-tone-red-bg text-danger" },
  money: {
    Icon: MoneyIcon,
    className: "bg-tone-orange-bg text-tone-orange-fg",
  },
  clock: { Icon: ClockIcon, className: "bg-tone-amber-bg text-warning" },
};

/** Rojo si ya pasó o es un cobro, ámbar de 0 a 3 días y gris en el resto. */
function getWhenClassName(
  { kind, sortDays }: AttentionItem,
  resolved: boolean,
) {
  if (resolved || sortDays === null) return "text-ink-muted";
  if (kind === "money" || sortDays < 0) return "text-danger";
  return sortDays <= 3 ? "text-warning" : "text-ink-muted";
}

function getSummary(pendingCount: number, total: number) {
  if (pendingCount === 0) return "Todo resuelto";
  return `${pendingCount} ${pendingCount === 1 ? "pendiente" : "pendientes"} de ${total}`;
}

export function AttentionList({
  items,
  moreCount,
  resolvedIds,
  onToggle,
}: {
  items: AttentionItem[];
  moreCount: number;
  resolvedIds: string[];
  onToggle: (id: string) => void;
}) {
  const headingId = useId();
  const pendingCount = items.filter(
    ({ id }) => !resolvedIds.includes(id),
  ).length;

  return (
    <section aria-labelledby={headingId} className="crm-card gap-1 px-6 py-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="crm-heading">
          Necesita tu atención
        </h2>
        <span className="text-compact text-ink-muted">
          {getSummary(pendingCount, items.length)}
        </span>
      </div>

      <ul className="flex flex-col">
        {items.map((item) => {
          const resolved = resolvedIds.includes(item.id);
          const { Icon, className } = KIND_ICONS[item.kind];
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 border-t border-line-soft py-2.5"
            >
              <label className="flex size-11 flex-none cursor-pointer items-center justify-center">
                <input
                  type="checkbox"
                  className="crm-checkbox accent-success"
                  checked={resolved}
                  onChange={() => onToggle(item.id)}
                  aria-label={`${resolved ? "Marcar como pendiente" : "Marcar como resuelto"}: ${item.title}`}
                />
              </label>
              <span
                aria-hidden="true"
                className={`flex size-[30px] flex-none items-center justify-center rounded-lg ${
                  resolved ? "bg-surface-hover text-tone-gray-dot" : className
                }`}
              >
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <Link
                href={item.href}
                className="-mx-2 -my-1.5 flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg px-2 py-1.5 hover:bg-surface-hover"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={`text-sm font-bold ${resolved ? "text-ink-muted line-through" : "text-ink"}`}
                  >
                    {item.title}
                  </span>
                  <span className="text-compact text-ink-muted">
                    {item.detail}
                  </span>
                </span>
                <span
                  className={`flex-none text-compact font-bold ${getWhenClassName(item, resolved)}`}
                >
                  {item.whenText}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {moreCount > 0 && (
        <p className="border-t border-line-soft pt-3 text-compact text-ink-muted">
          y {moreCount} {moreCount === 1 ? "aviso más" : "avisos más"}
        </p>
      )}
    </section>
  );
}
