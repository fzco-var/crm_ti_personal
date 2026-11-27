"use client";

import { useId } from "react";
import { FieldLabel } from "@/components/form-field";
import { PillRadioGroup } from "@/components/pill-radio-group";
import {
  DATE_FORMAT_OPTIONS,
  TIME_ZONE_OPTIONS,
} from "@/features/settings/constants";
import type {
  RegionalSettings,
  TimeZone,
} from "@/features/settings/types/settings";
import { formatDateExample } from "@/features/settings/utils";

export function RegionalSection({
  value,
  today,
  changes,
  onChange,
}: {
  value: RegionalSettings;
  /** "Hoy" del navegador, como "2026-11-27", para los ejemplos de formato. */
  today: string;
  changes: { timeZone: boolean; dateFormat: boolean };
  onChange: (value: RegionalSettings) => void;
}) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-heading`} className="crm-heading">
          Regional
        </h2>
        <p className="text-sm text-ink-muted">
          Por ahora las demás pantallas siguen mostrando las fechas como{" "}
          {formatDateExample("short", today)}.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel
          htmlFor={`${id}-time-zone`}
          modified={changes.timeZone}
          modifiedText="modificada"
        >
          Zona horaria
        </FieldLabel>
        <select
          id={`${id}-time-zone`}
          className="crm-field px-3"
          value={value.timeZone}
          onChange={(event) =>
            onChange({ ...value, timeZone: event.target.value as TimeZone })
          }
        >
          {TIME_ZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <PillRadioGroup
        label="Formato de fecha"
        options={DATE_FORMAT_OPTIONS.map((format) => ({
          value: format,
          label: formatDateExample(format, today),
        }))}
        value={value.dateFormat}
        modified={changes.dateFormat}
        onChange={(dateFormat) => onChange({ ...value, dateFormat })}
      />

      <dl className="flex flex-col gap-1.5">
        <dt className="crm-label">Moneda</dt>
        <dd className="text-field font-medium">CLP · peso chileno</dd>
        <dd className="text-sm text-ink-muted">
          Los montos se registran en pesos enteros, sin decimales.
        </dd>
      </dl>
    </section>
  );
}
