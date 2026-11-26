"use client";

import { useId } from "react";
import { FieldError, FieldLabel, TextField } from "@/components/form-field";
import { TONE_DOT_CLASSES } from "@/components/tone";
import type { Project } from "@/features/projects/types/project";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/features/tickets/constants";
import type {
  TicketFormErrors,
  TicketFormValues,
  TicketStatus,
} from "@/features/tickets/types/ticket";
import {
  addDays,
  formatDate,
  getDaysUntil,
  getDueText,
} from "@/features/tickets/utils";

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

interface StatusFieldsProps {
  values: TicketFormValues;
  errors: TicketFormErrors;
  today: string | null;
  onChange: (changes: Partial<TicketFormValues>) => void;
  /** Solo en el alta: avisa si la fecha supera el término del proyecto. */
  project?: Project;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: TicketFormValues;
  /** En la edición, la espera cuenta como cambio. */
  waitingModified?: boolean;
}

/**
 * Estado, prioridad y fecha límite. En el alta, sin `today` (durante el
 * prerender), los atajos de fecha quedan deshabilitados.
 */
export function StatusFields(props: StatusFieldsProps) {
  const { values, original, onChange } = props;
  const id = useId();
  const statusChanged = original && values.status !== original.status;

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 id={`${id}-heading`} className="crm-heading">
          {original ? "Estado" : "Estado y plazo"}
        </h2>
        {statusChanged && (
          <span className="text-xs font-bold text-accent">
            · {original.status} → {values.status}
          </span>
        )}
      </div>

      {original ? (
        <EditStatusOptions {...props} />
      ) : (
        <NewStatusOptions {...props} />
      )}

      <PillRadioGroup
        label="Prioridad"
        options={PRIORITY_OPTIONS}
        value={values.priority}
        modified={original && values.priority !== original.priority}
        onChange={(priority) => onChange({ priority })}
      />

      {original ? (
        <EditDueDateField {...props} />
      ) : (
        <NewDueDateField {...props} />
      )}
    </section>
  );
}

function NewStatusOptions({ values, onChange }: StatusFieldsProps) {
  const name = useId();

  return (
    <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5">
      <legend className="crm-label mb-2">Estado del ticket</legend>
      {NEW_TICKET_STATUSES.map(({ value, description }) => (
        <label key={value} className="crm-option">
          <input
            type="radio"
            name={name}
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
  );
}

/** Al cerrar pide la resolución; en espera, qué se espera. */
function EditStatusOptions({
  values,
  errors,
  original,
  waitingModified,
  onChange,
}: StatusFieldsProps) {
  const id = useId();
  const closing = values.status === "Cerrado" && original?.status !== "Cerrado";

  return (
    <>
      <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        <legend className="sr-only">Estado del ticket</legend>
        {TICKET_STATUSES.map((value) => (
          <label
            key={value}
            className="crm-option min-h-[52px] items-center py-0"
          >
            <input
              type="radio"
              name={`${id}-status`}
              value={value}
              checked={values.status === value}
              onChange={() => onChange({ status: value })}
              className="mt-0"
            />
            <TicketStatusBadge status={value} />
          </label>
        ))}
      </fieldset>

      {closing && (
        <div
          className={`flex flex-col gap-1.5 rounded-xl border bg-surface-muted p-4 ${errors.resolution ? "border-danger" : "border-line"}`}
        >
          <label htmlFor={`${id}-resolution`} className="text-sm font-bold">
            Resolución
          </label>
          <span
            id={`${id}-resolution-hint`}
            className="text-compact text-ink-muted"
          >
            Qué se hizo para resolverlo. Te servirá la próxima vez que pase.
          </span>
          <textarea
            id={`${id}-resolution`}
            rows={3}
            className="crm-textarea"
            placeholder="Ej. Se paginó la consulta al ERP y se agregó caché de 10 minutos para las facturas."
            value={values.resolution}
            aria-invalid={errors.resolution ? true : undefined}
            aria-describedby={
              errors.resolution
                ? `${id}-resolution-error`
                : `${id}-resolution-hint`
            }
            onChange={(event) => onChange({ resolution: event.target.value })}
          />
          <FieldError id={`${id}-resolution-error`}>
            {errors.resolution}
          </FieldError>
        </div>
      )}

      {values.status === "En espera" && (
        <TextField
          label={
            <>
              ¿Qué estás esperando?{" "}
              <span className="font-medium text-ink-muted">(opcional)</span>
            </>
          }
          className="crm-field crm-field-sm"
          placeholder="Ej. Que el cliente entregue el acceso a la API del ERP"
          value={values.waitingFor}
          modified={waitingModified}
          onChange={(event) => onChange({ waitingFor: event.target.value })}
        />
      )}
    </>
  );
}

function NewDueDateField({
  values,
  errors,
  project,
  today,
  onChange,
}: StatusFieldsProps) {
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

/** Vencida en rojo; hoy o mañana en ámbar; cerrada o sin fecha, neutra. */
function getDueClassName(dueDate: string, status: TicketStatus, today: string) {
  if (!dueDate || status === "Cerrado") return "text-ink-muted";
  const days = getDaysUntil(dueDate, today);
  if (days < 0) return "font-bold text-danger";
  return days <= 1 ? "font-bold text-warning" : "text-ink-muted";
}

function EditDueDateField({
  values,
  original,
  today,
  onChange,
}: StatusFieldsProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={id}
        modified={original && values.dueDate !== original.dueDate}
      >
        Fecha límite
      </FieldLabel>
      <input
        id={id}
        type="date"
        className="crm-field max-w-[240px] font-mono text-sm"
        value={values.dueDate}
        aria-describedby={`${id}-text`}
        onChange={(event) => onChange({ dueDate: event.target.value })}
      />
      {today && (
        <span
          id={`${id}-text`}
          className={`text-compact ${getDueClassName(values.dueDate, values.status, today)}`}
        >
          {getDueText(values.dueDate, values.status, today)}
        </span>
      )}
    </div>
  );
}
