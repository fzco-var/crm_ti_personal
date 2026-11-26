"use client";

import { useId } from "react";
import type { ServiceFormValues } from "@/features/services/types/service";
import {
  formatCLP,
  formatCLPDelta,
  getFormProvider,
  getMonthlyContribution,
  getServiceCompany,
} from "@/features/services/utils";
import { formatDate } from "@/features/tickets/utils";

function getDeltaText(values: ServiceFormValues, delta: number) {
  if (delta) return `${formatCLPDelta(delta)} al mes`;
  return values.status === "En pausa"
    ? "En pausa: no suma hasta que lo actives"
    : "Escribe el cobro para ver el impacto";
}

/** Vista previa del alta; `baseRevenue` es el ingreso mensual actual. */
export function ServicePreview({
  values,
  baseRevenue,
}: {
  values: ServiceFormValues;
  baseRevenue: number;
}) {
  const headingId = useId();
  const delta = getMonthlyContribution(values);
  const company = values.clientId ? getServiceCompany(values) : "";

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Vista previa
      </h2>

      <div className="flex flex-col gap-2.5 rounded-xl border border-line-soft p-3.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-sm leading-[1.35] font-bold">
            {values.name.trim() || "Nombre del servicio"}
          </span>
          <span className="text-xs text-ink-muted">
            {getFormProvider(values).trim() || "Proveedor"} · {values.type}
          </span>
        </span>
        <span className="text-compact font-semibold">
          {company || "Cliente"}
        </span>
        <span className="font-mono text-field font-medium">
          {formatCLP(values.charge)}
          <span className="font-sans text-xs text-ink-muted">
            {" "}
            / {values.period}
          </span>
        </span>
        <span className="text-xs text-ink-muted">
          {values.renewDate
            ? `Renueva el ${formatDate(values.renewDate)} · ${values.autoRenew ? "automática" : "manual"}`
            : "Sin fecha de renovación"}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-line-soft pt-4">
        <span className="text-compact font-bold">
          Impacto en tu ingreso mensual
        </span>
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-compact text-ink-muted">
            {formatCLP(baseRevenue)}
          </span>
          <span aria-hidden="true" className="text-ink-muted">
            →
          </span>
          <span className="sr-only">pasa a</span>
          <span className="font-mono text-lg font-medium">
            {formatCLP(baseRevenue + delta)}
          </span>
        </span>
        <span className="text-compact font-bold text-tone-green-fg">
          {getDeltaText(values, delta)}
        </span>
        {values.period === "año" && values.charge > 0 && (
          <span className="text-xs text-ink-muted">
            Al ser anual, se cuenta como 1/12 por mes.
          </span>
        )}
      </div>
    </aside>
  );
}
