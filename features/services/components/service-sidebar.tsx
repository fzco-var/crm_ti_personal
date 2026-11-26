"use client";

import Link from "next/link";
import { useId } from "react";
import { services } from "@/data/services";
import type {
  Service,
  ServiceCharge,
  ServiceFormValues,
} from "@/features/services/types/service";
import {
  formatCLP,
  formatCLPDelta,
  getChargesSummary,
  getMonthlyContribution,
  getMonthlyRevenue,
  getOtherServices,
  getServiceCompany,
} from "@/features/services/utils";

/** Resumen de cobros, impacto en el ingreso y otros servicios de la empresa. */
export function ServiceSidebar({
  service,
  values,
  original,
  charges,
}: {
  service: Service;
  values: ServiceFormValues;
  original: ServiceFormValues;
  charges: ServiceCharge[];
}) {
  return (
    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
      <ChargesSummary charges={charges} />
      <RevenueImpact service={service} values={values} original={original} />
      <OtherServices service={service} />
    </aside>
  );
}

function ChargesSummary({ charges }: { charges: ServiceCharge[] }) {
  const id = useId();
  const { collected, providerCost, profit } = getChargesSummary(charges);

  return (
    <section aria-labelledby={id} className="crm-card gap-3.5 p-6">
      <h2 id={id} className="text-base font-bold">
        Resumen
      </h2>
      <dl className="flex flex-col gap-3 text-compact">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Cobrado en total</dt>
          <dd className="font-mono font-medium">{formatCLP(collected)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Pagado al proveedor</dt>
          <dd className="font-mono">{formatCLP(providerCost)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">Ganancia acumulada</dt>
          <dd className="font-mono font-bold text-tone-green-fg">
            {formatCLP(profit)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

/** Ingreso con el estado y el cobro guardados, contra los elegidos. */
function RevenueImpact({
  service,
  values,
  original,
}: {
  service: Service;
  values: ServiceFormValues;
  original: ServiceFormValues;
}) {
  const id = useId();
  const others = getMonthlyRevenue(services) - getMonthlyContribution(service);
  const before = others + getMonthlyContribution(original);
  const after = others + getMonthlyContribution(values);
  const delta = after - before;
  const deltaTone =
    delta < 0
      ? "text-danger"
      : delta > 0
        ? "text-tone-green-fg"
        : "text-ink-muted";

  return (
    <section aria-labelledby={id} className="crm-card gap-2 p-6">
      <h2 id={id} className="text-base font-bold">
        Impacto en tu ingreso mensual
      </h2>
      <span className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-compact text-ink-muted">
          {formatCLP(before)}
        </span>
        <span aria-hidden="true" className="text-ink-muted">
          →
        </span>
        <span className="sr-only">pasa a</span>
        <span className="font-mono text-lg font-medium">
          {formatCLP(after)}
        </span>
      </span>
      <span className={`text-compact font-bold ${deltaTone}`}>
        {Math.round(delta) === 0
          ? "Sin cambios en el ingreso mensual"
          : `${formatCLPDelta(delta)} al mes`}
      </span>
    </section>
  );
}

function OtherServices({ service }: { service: Service }) {
  const id = useId();
  const others = getOtherServices(service);

  return (
    <section aria-labelledby={id} className="crm-card gap-2 p-6">
      <h2 id={id} className="text-base font-bold">
        Otros servicios de {getServiceCompany(service)}
      </h2>
      {others.length === 0 ? (
        <p className="text-compact text-ink-muted">Sin otros servicios.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-compact">
          {others.map((other) => (
            <li key={other.id} className="flex justify-between gap-3">
              <Link
                href={`/services/${other.id}`}
                className="min-w-0 underline-offset-[3px] hover:underline"
              >
                {other.name}
              </Link>
              <span className="flex-none font-mono">
                {formatCLP(other.charge)}/{other.period}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
