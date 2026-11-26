"use client";

import { useId } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";
import type { ProjectFormValues } from "@/features/projects/types/project";
import {
  addMonths,
  formatDayDelta,
  formatDurationText,
  getDurationDays,
  isWeekend,
} from "@/features/projects/utils";
import { addDays, formatDate, getDaysUntil } from "@/features/tickets/utils";

export type ProjectDateErrors = Partial<
  Record<"startDate" | "endDate", string>
>;

/** Atajos: suman a partir de una fecha base. */
const DURATION_SHORTCUTS = [
  { label: "+2 semanas", apply: (date: string) => addDays(date, 14) },
  { label: "+1 mes", apply: (date: string) => addMonths(date, 1) },
  { label: "+3 meses", apply: (date: string) => addMonths(date, 3) },
  { label: "+6 meses", apply: (date: string) => addMonths(date, 6) },
];

const MOVE_SHORTCUTS = [
  { label: "+1 semana", apply: (date: string) => addDays(date, 7) },
  { label: "+2 semanas", apply: (date: string) => addDays(date, 14) },
  { label: "+1 mes", apply: (date: string) => addMonths(date, 1) },
];

interface ProjectDateFieldsProps {
  values: ProjectFormValues;
  errors: ProjectDateErrors;
  /** Nula durante el prerender: los atajos quedan deshabilitados. */
  today: string | null;
  onChange: (changes: Partial<ProjectFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ProjectFormValues;
  /** Solo en la edición: motivo del cambio de término. */
  reason?: string;
  onReasonChange?: (reason: string) => void;
  disabled?: boolean;
}

/**
 * Inicio y término. El alta ofrece "Duración rápida" desde el inicio; la
 * edición, "Mover término" desde el término y el motivo si cambia.
 */
export function ProjectDateFields({
  values,
  errors,
  today,
  onChange,
  original,
  reason = "",
  onReasonChange,
  disabled,
}: ProjectDateFieldsProps) {
  const id = useId();
  const modified =
    original &&
    (values.startDate !== original.startDate ||
      values.endDate !== original.endDate);
  const duration = getDurationDays(values.startDate, values.endDate);

  const shortcuts = original
    ? [
        ...MOVE_SHORTCUTS.map(({ label, apply }) => ({
          label,
          base: values.endDate || today,
          apply,
        })),
        { label: "Hoy", base: today, apply: (date: string) => date },
      ]
    : DURATION_SHORTCUTS.map(({ label, apply }) => ({
        label,
        base: values.startDate || today,
        apply,
      }));

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 id={`${id}-heading`} className="crm-heading">
          Fechas
        </h2>
        {modified && (
          <span className="text-xs font-bold text-accent">· modificadas</span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
        <DateField
          label="Fecha de inicio"
          value={values.startDate}
          error={errors.startDate}
          disabled={disabled}
          onChange={(startDate) => onChange({ startDate })}
        />
        <DateField
          label="Fecha de término"
          value={values.endDate}
          min={values.startDate || undefined}
          error={errors.endDate}
          disabled={disabled}
          onChange={(endDate) => onChange({ endDate })}
        />
      </div>

      <div
        role="group"
        aria-labelledby={`${id}-shortcuts`}
        className="flex flex-wrap items-center gap-2"
      >
        <span id={`${id}-shortcuts`} className="text-compact text-ink-muted">
          {original ? "Mover término:" : "Duración rápida:"}
        </span>
        {shortcuts.map(({ label, base, apply }) => (
          <button
            key={label}
            type="button"
            className="crm-chip disabled:cursor-not-allowed disabled:opacity-45"
            disabled={disabled || !base}
            onClick={() => base && onChange({ endDate: apply(base) })}
          >
            {label}
          </button>
        ))}
      </div>

      {!original && duration !== null && duration >= 0 && (
        <span className="text-sm text-ink-soft">
          Duración: <strong>{formatDurationText(duration)}</strong>
          {isWeekend(values.endDate) && " · ojo: termina en fin de semana"}
        </span>
      )}

      {original && values.endDate && values.endDate !== original.endDate && (
        <EndMovedBox
          previous={original.endDate}
          current={values.endDate}
          reason={reason}
          disabled={disabled}
          onReasonChange={onReasonChange}
        />
      )}
    </section>
  );
}

function DateField({
  label,
  value,
  min,
  error,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="date"
        className="crm-field font-mono text-sm"
        value={value}
        min={min}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

/** Retrasar el término se marca en ámbar; adelantarlo, en verde. */
function EndMovedBox({
  previous,
  current,
  reason,
  disabled,
  onReasonChange,
}: {
  previous: string;
  current: string;
  reason: string;
  disabled?: boolean;
  onReasonChange?: (reason: string) => void;
}) {
  const id = useId();
  const delta = getDaysUntil(current, previous);
  const toneClasses =
    delta > 0
      ? "border-tone-amber-line bg-tone-amber-bg text-tone-amber-fg"
      : "border-tone-green-line bg-tone-green-bg text-tone-green-fg";

  return (
    <div
      className={`flex flex-col gap-2.5 rounded-xl border px-4 py-3.5 ${toneClasses}`}
    >
      <span className="text-sm">
        Término:{" "}
        <span className="font-mono line-through">{formatDate(previous)}</span> →{" "}
        <strong className="font-mono">{formatDate(current)}</strong>{" "}
        <strong>({formatDayDelta(delta)})</strong>
      </span>
      <label htmlFor={id} className="text-compact font-semibold text-ink">
        Motivo del cambio{" "}
        <span className="font-medium text-ink-muted">
          (queda en el historial)
        </span>
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        className="crm-field h-[42px] px-3 text-sm"
        placeholder="Ej. El cliente pidió agregar pago con Webpay"
        value={reason}
        disabled={disabled}
        onChange={(event) => onReasonChange?.(event.target.value)}
      />
    </div>
  );
}
