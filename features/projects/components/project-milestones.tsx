"use client";

import { useId } from "react";
import { FieldError } from "@/components/form-field";
import { PlusIcon, TrashIcon } from "@/components/icons";
import type { MilestoneFormValues } from "@/features/projects/types/project";
import {
  areMilestonesEqual,
  getMilestoneOverdueText,
  isMilestoneOutOfRange,
} from "@/features/projects/utils";

interface ProjectMilestonesProps {
  milestones: MilestoneFormValues[];
  startDate: string;
  endDate: string;
  onChange: (milestones: MilestoneFormValues[]) => void;
  /** Solo en la edición: avisa de los hitos vencidos. */
  today?: string | null;
  /** Hitos guardados. Solo en la edición: casilla, resumen y cambios. */
  original?: MilestoneFormValues[];
  disabled?: boolean;
}

function getSummary(milestones: MilestoneFormValues[]) {
  if (milestones.length === 0) return "Sin hitos.";
  const done = milestones.filter((milestone) => milestone.done).length;
  const pending = milestones.length - done;
  return `${done} de ${milestones.length} hechos · ${pending ? `${pending} pendientes` : "todo listo"}`;
}

/** Un hito con fecha fuera del inicio y el término impide guardar. */
export function ProjectMilestones({
  milestones,
  startDate,
  endDate,
  onChange,
  today,
  original,
  disabled,
}: ProjectMilestonesProps) {
  const id = useId();
  const modified = original && !areMilestonesEqual(milestones, original);

  function update(key: string, changes: Partial<MilestoneFormValues>) {
    onChange(
      milestones.map((milestone) =>
        milestone.key === key ? { ...milestone, ...changes } : milestone,
      ),
    );
  }

  function add() {
    onChange([
      ...milestones,
      { key: crypto.randomUUID(), name: "", date: "", done: false },
    ]);
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id={`${id}-heading`} className="crm-heading">
              Hitos
              {!original && (
                <span className="text-sm font-medium text-ink-muted">
                  {" "}
                  (opcional)
                </span>
              )}
            </h2>
            {modified && (
              <span className="text-xs font-bold text-accent">
                · modificados
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted">
            {original
              ? getSummary(milestones)
              : "Entregas o revisiones intermedias."}
          </p>
        </div>
        <button
          type="button"
          className="crm-btn crm-btn-sm crm-btn-secondary"
          disabled={disabled}
          onClick={add}
        >
          <PlusIcon size={14} />
          Agregar hito
        </button>
      </div>

      {!original && milestones.length === 0 && (
        <span className="text-compact text-ink-muted">
          Sin hitos. Puedes agregarlos ahora o más adelante.
        </span>
      )}

      {milestones.length > 0 && (
        <ol className="flex flex-col gap-2.5">
          {milestones.map((milestone, index) => (
            <MilestoneRow
              key={milestone.key}
              milestone={milestone}
              number={index + 1}
              startDate={startDate}
              endDate={endDate}
              today={today}
              editing={Boolean(original)}
              disabled={disabled}
              onChange={(changes) => update(milestone.key, changes)}
              onRemove={() =>
                onChange(milestones.filter(({ key }) => key !== milestone.key))
              }
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function MilestoneRow({
  milestone,
  number,
  startDate,
  endDate,
  today,
  editing,
  disabled,
  onChange,
  onRemove,
}: {
  milestone: MilestoneFormValues;
  number: number;
  startDate: string;
  endDate: string;
  today?: string | null;
  editing: boolean;
  disabled?: boolean;
  onChange: (changes: Partial<MilestoneFormValues>) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const outOfRange = isMilestoneOutOfRange(milestone.date, startDate, endDate);
  const overdueText =
    editing && today ? getMilestoneOverdueText(milestone, today) : null;
  const done = editing && milestone.done;

  return (
    <li
      className={`flex flex-wrap items-start gap-2.5 rounded-xl border border-line p-3 ${done ? "bg-tone-green-bg" : "bg-surface-muted"}`}
    >
      {editing ? (
        <label className="size-[46px] flex-none justify-center">
          <input
            type="checkbox"
            className="crm-checkbox size-5 accent-success"
            checked={milestone.done}
            disabled={disabled}
            onChange={(event) => onChange({ done: event.target.checked })}
          />
          <span className="sr-only">
            {milestone.done ? "Marcar como pendiente: " : "Marcar como hecho: "}
            {milestone.name || `hito ${number}`}
          </span>
        </label>
      ) : (
        <span className="flex h-[46px] w-7 flex-none items-center justify-center font-mono text-compact text-ink-muted">
          {number}
        </span>
      )}

      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
        <label htmlFor={`${id}-name`} className="sr-only">
          Nombre del hito {number}
        </label>
        <input
          id={`${id}-name`}
          type="text"
          autoComplete="off"
          className={`crm-field text-sm ${done ? "text-ink-muted line-through" : ""}`}
          placeholder={editing ? undefined : "Ej. MVP en ambiente de pruebas"}
          value={milestone.name}
          disabled={disabled}
          aria-describedby={overdueText ? `${id}-overdue` : undefined}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        {overdueText && (
          <span id={`${id}-overdue`} className="text-xs font-bold text-danger">
            {overdueText}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-[0_1_180px] flex-col gap-1">
        <label htmlFor={`${id}-date`} className="sr-only">
          Fecha del hito {number}
        </label>
        <input
          id={`${id}-date`}
          type="date"
          className="crm-field px-3 font-mono text-compact"
          min={startDate || undefined}
          max={endDate || undefined}
          value={milestone.date}
          disabled={disabled}
          aria-invalid={outOfRange ? true : undefined}
          aria-describedby={outOfRange ? `${id}-error` : undefined}
          onChange={(event) => onChange({ date: event.target.value })}
        />
        <FieldError id={`${id}-error`}>
          {outOfRange ? "Fuera del rango del proyecto." : undefined}
        </FieldError>
      </div>

      <button
        type="button"
        className="crm-icon-btn size-[46px] flex-none"
        aria-label={`Quitar hito ${number}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <TrashIcon />
      </button>
    </li>
  );
}
