"use client";

import { useId } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";
import { TONE_DOT_CLASSES } from "@/components/tone";
import type { Project } from "@/features/projects/types/project";
import { PillRadioGroup } from "@/features/tickets/components/pill-radio-group";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import { TICKET_PRIORITIES } from "@/features/tickets/constants";
import type {
  TicketFormErrors,
  TicketFormValues,
  TicketStatus,
} from "@/features/tickets/types/ticket";
import { addDays, formatDate } from "@/features/tickets/utils";

// Un ticket nuevo no empieza cerrado.
const NEW_TICKET_STATUSES: { value: TicketStatus; description: string }[] = [
  { value: "Abierto", description: "Recién reportado, nadie lo ha tomado." },
  { value: "En curso", description: "Ya estás trabajando en él." },
  { value: "En espera", description: "Depende del cliente o de un proveedor." },
];

const PRIORITY_OPTIONS = TICKET_PRIORITIES.map(({ value, tone }) => ({
  value,
  dotClassName: TONE_DOT_CLASSES[tone],
}));

const DUE_SHORTCUTS = [
  { label: "Hoy", days: 0 },
  { label: "Mañana", days: 1 },
  { label: "+3 días", days: 3 },
  { label: "+1 semana", days: 7 },
];

/**
 * Estado, prioridad y fecha límite del alta. Sin `today`, durante el
 * prerender, los atajos de fecha quedan deshabilitados.
 */
export function StatusFields({
  values,
  errors,
  project,
  today,
  onChange,
}: {
  values: TicketFormValues;
  errors: TicketFormErrors;
  project?: Project;
  today: string | null;
  onChange: (changes: Partial<TicketFormValues>) => void;
}) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Estado y plazo
      </h2>

      <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5">
        <legend className="crm-label mb-2">Estado del ticket</legend>
        {NEW_TICKET_STATUSES.map(({ value, description }) => (
          <label key={value} className="crm-option">
            <input
              type="radio"
              name={`${id}-status`}
              value={value}
              checked={values.status === value}
              onChange={() => onChange({ status: value })}
            />
            <span className="flex flex-col gap-1.5">
              <span className="self-start">
                <TicketStatusBadge status={value} />
              </span>
              <span className="text-compact leading-[1.45] text-ink-soft">
                {description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <PillRadioGroup
        label="Prioridad"
        options={PRIORITY_OPTIONS}
        value={values.priority}
        onChange={(priority) => onChange({ priority })}
      />

      <DueDateField
        values={values}
        errors={errors}
        project={project}
        today={today}
        onChange={onChange}
      />
    </section>
  );
}

function DueDateField({
  values,
  errors,
  project,
  today,
  onChange,
}: {
  values: TicketFormValues;
  errors: TicketFormErrors;
  project?: Project;
  today: string | null;
  onChange: (changes: Partial<TicketFormValues>) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const projectEnd =
    today && project ? addDays(today, project.endInDays) : null;
  const isAfterProjectEnd = Boolean(
    projectEnd &&
    project?.status !== "Completado" &&
    values.dueDate &&
    values.dueDate > projectEnd,
  );

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={id}>
        Fecha límite{" "}
        <span className="font-medium text-ink-muted">(opcional)</span>
      </FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={id}
          type="date"
          className="crm-field flex-[0_1_220px] font-mono text-sm"
          value={values.dueDate}
          aria-invalid={errors.dueDate ? true : undefined}
          aria-describedby={errors.dueDate ? errorId : undefined}
          onChange={(event) => onChange({ dueDate: event.target.value })}
        />
        {DUE_SHORTCUTS.map(({ label, days }) => (
          <button
            key={label}
            type="button"
            className="crm-chip disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!today}
            onClick={() => today && onChange({ dueDate: addDays(today, days) })}
          >
            {label}
          </button>
        ))}
      </div>
      <FieldError id={errorId}>{errors.dueDate}</FieldError>
      {isAfterProjectEnd && projectEnd && (
        <span className="text-compact text-tone-amber-fg">
          Es posterior al término del proyecto ({formatDate(projectEnd)}).
        </span>
      )}
    </div>
  );
}
