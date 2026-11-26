"use client";

import { useId } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { TONE_DOT_CLASSES } from "@/components/tone";
import {
  SERVICE_CREATE_STATUSES,
  SERVICE_NOTICE_DAYS,
  SERVICE_STATUS_TONES,
} from "@/features/services/constants";
import type {
  ServiceFormValues,
  ServiceNoticeDays,
} from "@/features/services/types/service";
import { formatDays, getDaysUntil } from "@/features/tickets/utils";

export type ServiceRenewalErrors = Partial<Record<"renewDate", string>>;

const STATUS_OPTIONS = SERVICE_CREATE_STATUSES.map((status) => ({
  value: status,
  dotClassName: TONE_DOT_CLASSES[SERVICE_STATUS_TONES[status]],
}));

/** Ayuda bajo la fecha cuando no hay error. */
function getRenewalHint(
  { renewDate, noticeDays, autoRenew }: ServiceFormValues,
  today: string,
  isEdit: boolean,
) {
  if (!renewDate) return isEdit ? "Sin fecha" : "";
  const days = getDaysUntil(renewDate, today);
  if (isEdit) {
    if (days < 0) return `Venció hace ${formatDays(-days)}`;
    return `En ${formatDays(days)} · ${autoRenew ? "se renueva sola" : "tienes que renovarla tú"}`;
  }
  return `En ${formatDays(days)} · te avisaremos ${noticeDays} días antes`;
}

/** Fecha, aviso, renovación automática y, solo en el alta, el estado inicial. */
export function ServiceRenewalFields({
  values,
  errors,
  today,
  onChange,
  original,
  disabled,
}: {
  values: ServiceFormValues;
  errors: ServiceRenewalErrors;
  today: string;
  onChange: (changes: Partial<ServiceFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ServiceFormValues;
  disabled?: boolean;
}) {
  const id = useId();
  const error = errors.renewDate;
  const hint = error ? "" : getRenewalHint(values, today, Boolean(original));
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <h2 id={`${id}-heading`} className="crm-heading">
        Renovación
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
        <div className="flex flex-col gap-1.5">
          <FieldLabel
            htmlFor={`${id}-date`}
            modified={original && values.renewDate !== original.renewDate}
            modifiedText="modificada"
          >
            Próxima renovación
          </FieldLabel>
          <input
            id={`${id}-date`}
            type="date"
            className="crm-field font-mono text-sm"
            value={values.renewDate}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange({ renewDate: event.target.value })}
          />
          <FieldError id={`${id}-error`}>{error}</FieldError>
          {hint && (
            <span id={`${id}-hint`} className="text-compact text-ink-muted">
              {hint}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel
            htmlFor={`${id}-notice`}
            modified={original && values.noticeDays !== original.noticeDays}
          >
            Avisarme antes
          </FieldLabel>
          <select
            id={`${id}-notice`}
            className="crm-field px-3"
            value={values.noticeDays}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                noticeDays: Number(event.target.value) as ServiceNoticeDays,
              })
            }
          >
            {SERVICE_NOTICE_DAYS.map((days) => (
              <option key={days} value={days}>
                {days} días antes
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        htmlFor={`${id}-auto`}
        className={original ? "font-semibold" : "items-start"}
      >
        <input
          id={`${id}-auto`}
          type="checkbox"
          className={`crm-checkbox ${original ? "" : "mt-0.5"}`}
          checked={values.autoRenew}
          disabled={disabled}
          onChange={(event) => onChange({ autoRenew: event.target.checked })}
        />
        {original ? (
          <span>
            Se renueva automáticamente
            {values.autoRenew !== original.autoRenew && (
              <span className="text-xs font-bold text-accent">
                {" "}
                · modificada
              </span>
            )}
          </span>
        ) : (
          <span className="flex flex-col gap-0.5">
            <span className="font-semibold">Se renueva automáticamente</span>
            <span className="text-compact text-ink-muted">
              Por ejemplo, un cobro con tarjeta. Si lo desmarcas, la renovación
              queda pendiente hasta que la registres.
            </span>
          </span>
        )}
      </label>

      {!original && (
        <PillRadioGroup
          label="Estado inicial"
          options={STATUS_OPTIONS}
          value={values.status}
          disabled={disabled}
          onChange={(status) => onChange({ status })}
        />
      )}
    </section>
  );
}
