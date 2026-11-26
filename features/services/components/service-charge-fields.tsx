"use client";

import { useId } from "react";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { MoneyField } from "@/features/services/components/money-field";
import { SERVICE_PERIODS } from "@/features/services/constants";
import type { ServiceFormValues } from "@/features/services/types/service";
import {
  formatCLP,
  formatPercentDelta,
  getMargin,
  getMarginPercent,
  getServiceCompany,
  isLowMargin,
} from "@/features/services/utils";
import { formatDate } from "@/features/tickets/utils";

export type ServiceChargeErrors = Partial<Record<"charge", string>>;

/** Periodicidad, cobro, costo y margen. */
export function ServiceChargeFields({
  values,
  errors,
  onChange,
  original,
  disabled,
}: {
  values: ServiceFormValues;
  errors: ServiceChargeErrors;
  onChange: (changes: Partial<ServiceFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ServiceFormValues;
  disabled?: boolean;
}) {
  const id = useId();
  const suffix = `CLP / ${values.period}`;

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Cobro y costo
      </h2>

      <PillRadioGroup
        label="Periodicidad"
        options={SERVICE_PERIODS}
        value={values.period}
        modified={original && values.period !== original.period}
        modifiedText="modificada"
        disabled={disabled}
        onChange={(period) => onChange({ period })}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
        <MoneyField
          label="Le cobras al cliente"
          value={values.charge}
          suffix={suffix}
          error={errors.charge}
          modified={original && values.charge !== original.charge}
          disabled={disabled}
          onChange={(charge) => onChange({ charge })}
        />
        <MoneyField
          label="Te cuesta a ti"
          value={values.cost}
          suffix={suffix}
          modified={original && values.cost !== original.cost}
          disabled={disabled}
          onChange={(cost) => onChange({ cost })}
        >
          {!original && (
            <span className="text-compact text-ink-muted">
              {values.type === "Mantención"
                ? "Tu tiempo no cuenta como costo aquí; déjalo en 0."
                : "Lo que pagas al proveedor. Si es en dólares, usa el valor aproximado en pesos."}
            </span>
          )}
        </MoneyField>
      </div>

      {original && values.charge > 0 && values.charge !== original.charge && (
        <PriceChangeBox values={values} original={original} />
      )}

      <MarginBox values={values} />
    </section>
  );
}

/** Solo en la edición: cobro anterior, nuevo y variación. */
function PriceChangeBox({
  values,
  original,
}: {
  values: ServiceFormValues;
  original: ServiceFormValues;
}) {
  const rises = values.charge >= original.charge;

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface-muted px-4 py-3.5 text-sm">
      <span>
        Cobro:{" "}
        <span className="font-mono text-ink-muted line-through">
          {formatCLP(original.charge)}
        </span>{" "}
        → <strong className="font-mono">{formatCLP(values.charge)}</strong>{" "}
        <strong className={rises ? "text-tone-green-fg" : "text-danger"}>
          ({formatPercentDelta(original.charge, values.charge)})
        </strong>
      </span>
      <span className="text-compact text-ink-muted">
        Se aplicará desde la próxima renovación (
        {values.renewDate ? formatDate(values.renewDate) : "—"}). Avísale a{" "}
        {getServiceCompany(values)} antes de esa fecha.
      </span>
    </div>
  );
}

/** Verde si el margen es sano; ámbar si es bajo o negativo. */
function MarginBox({ values }: { values: ServiceFormValues }) {
  const { charge, cost, period } = values;
  const margin = getMargin(charge, cost);
  const low = isLowMargin(charge, cost);
  const tone =
    low || margin < 0
      ? "border-tone-amber-line bg-tone-amber-bg text-tone-amber-fg"
      : "border-tone-green-line bg-tone-green-bg text-tone-green-fg";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5 text-sm ${tone}`}
    >
      <span className="font-bold">
        Margen: {formatCLP(margin)} / {period}
      </span>
      {charge > 0 && (
        <span>· {getMarginPercent(charge, cost)}% de lo que cobras</span>
      )}
      {low && (
        <span className="text-compact">
          · Ojo: si el proveedor sube el precio o cambia el dólar, podrías
          perder plata.
        </span>
      )}
    </div>
  );
}
