"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  DEFAULT_RENEWAL_RANGE,
  RENEWAL_RANGES,
} from "@/features/dashboard/constants";
import type { RenewalRange } from "@/features/dashboard/types/dashboard";
import { getRenewals } from "@/features/dashboard/utils";
import { formatCLP } from "@/features/services/utils";

/** "hoy", "4 d" o "hace 2 d". */
function formatRenewalDays(days: number) {
  if (days === 0) return "hoy";
  return days < 0 ? `hace ${-days} d` : `${days} d`;
}

/** Rojo hasta 3 días (y vencidas) y ámbar hasta 7. */
function getDaysClassName(days: number) {
  if (days <= 3) return "text-danger";
  return days <= 7 ? "text-warning" : "text-ink-muted";
}

function getFooter(count: number, manualCount: number, range: RenewalRange) {
  const renewals = count === 1 ? "1 renovación" : `${count} renovaciones`;
  const manual = manualCount === 1 ? "1 manual" : `${manualCount} manuales`;
  return `${renewals} en ${range} días · ${manual}`;
}

export function RenewalsTimeline() {
  const headingId = useId();
  const [range, setRange] = useState<RenewalRange>(DEFAULT_RENEWAL_RANGE);
  const { list, manualCount } = getRenewals(range);

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3.5 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="crm-heading">
          Próximas renovaciones
        </h2>
        <div role="group" aria-label="Rango" className="crm-segmented">
          {RENEWAL_RANGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className="crm-segment"
              aria-pressed={range === value}
              onClick={() => setRange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Sin renovaciones en los próximos {range} días.
        </p>
      ) : (
        <>
          <ol className="flex flex-col">
            {list.map(({ service, company }) => (
              <li key={service.id} className="flex gap-3.5">
                <span className="flex w-11 flex-none flex-col items-center">
                  <span
                    className={`font-mono text-xs font-bold ${getDaysClassName(service.renewInDays)}`}
                  >
                    {formatRenewalDays(service.renewInDays)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 min-h-2.5 w-0.5 flex-1 bg-line-soft"
                  />
                </span>
                <Link
                  href={`/services/${service.id}`}
                  className="-mx-2 flex min-w-0 flex-1 justify-between gap-3 rounded-lg px-2 pt-1 pb-3.5 hover:bg-surface-hover"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-compact font-bold">
                      {service.name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {company} · {service.type}
                    </span>
                  </span>
                  <span className="flex flex-none flex-col gap-0.5 text-right">
                    <span className="font-mono text-compact">
                      {formatCLP(service.charge)}/{service.period}
                    </span>
                    <span
                      className={`text-2xs font-bold ${service.autoRenew ? "text-ink-muted" : "text-tone-orange-fg"}`}
                    >
                      {service.autoRenew
                        ? "Automática"
                        : "Manual · renuévala tú"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <span className="text-compact text-ink-muted">
            {getFooter(list.length, manualCount, range)}
          </span>
        </>
      )}
    </section>
  );
}
