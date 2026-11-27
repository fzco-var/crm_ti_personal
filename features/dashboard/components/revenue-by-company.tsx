"use client";

import { useId } from "react";
import { Alert } from "@/components/alert";
import { CONCENTRATION_RATIO } from "@/features/dashboard/constants";
import type { getRevenueByCompany } from "@/features/dashboard/utils";
import { formatCLP } from "@/features/services/utils";

type RevenueByCompany = ReturnType<typeof getRevenueByCompany>;

// Ancho mínimo de la barra, para que la empresa más chica se vea.
const MIN_BAR_PERCENT = 2;

export function RevenueByCompany({ rows }: Pick<RevenueByCompany, "rows">) {
  const headingId = useId();
  const max = rows[0]?.amount ?? 0;
  const top = rows[0];

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3.5 px-6 py-5">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="crm-heading">
          Ingreso recurrente por cliente
        </h2>
        <span className="text-compact text-ink-muted">
          Pesos al mes · servicios activos
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">Sin servicios activos.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map(({ company, amount, percent, serviceCount }) => (
            <li
              key={company}
              title={`${company}: ${formatCLP(amount)} al mes (${percent}% del total) · ${
                serviceCount === 1 ? "1 servicio" : `${serviceCount} servicios`
              }`}
              className="flex flex-col gap-1.5"
            >
              <span className="flex justify-between gap-3 text-compact">
                <span className="font-semibold text-ink">{company}</span>
                <span className="font-mono text-ink">
                  {formatCLP(amount)}{" "}
                  <span className="text-ink-muted">· {percent}%</span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-2.5 overflow-hidden rounded bg-surface-hover"
              >
                <span
                  className="h-full rounded bg-ink-soft"
                  style={{
                    width: `${Math.max(MIN_BAR_PERCENT, (amount / max) * 100)}%`,
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}

      {top && top.share >= CONCENTRATION_RATIO && (
        <Alert variant="warning">
          <strong>
            {top.company} aporta el {top.percent}% de tu ingreso recurrente.
          </strong>{" "}
          Si se va, pierdes la mayor parte de tu ingreso fijo: vale la pena
          sumar mantenciones en otros clientes.
        </Alert>
      )}
    </section>
  );
}
