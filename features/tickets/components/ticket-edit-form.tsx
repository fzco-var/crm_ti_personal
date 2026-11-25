"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { FieldLabel, TextField } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import { TONE_DOT_CLASSES } from "@/components/tone";
import { findProjectById } from "@/features/projects/utils";
import { PillRadioGroup } from "@/features/tickets/components/pill-radio-group";
import { ProjectFields } from "@/features/tickets/components/project-fields";
import { StatusFields } from "@/features/tickets/components/status-fields";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import {
  getSaveEntries,
  TicketActivity,
  type TicketChange,
} from "@/features/tickets/components/ticket-activity";
import { TicketDangerZone } from "@/features/tickets/components/ticket-danger-zone";
import { TicketSidebar } from "@/features/tickets/components/ticket-sidebar";
import { useToday } from "@/features/tickets/components/use-today";
import {
  TICKET_PRIORITIES,
  TICKET_STATUS_TONES,
  TICKET_TYPES,
} from "@/features/tickets/constants";
import type {
  Ticket,
  TicketFormErrors,
  TicketFormValues,
  TicketStatus,
} from "@/features/tickets/types/ticket";
import {
  addDays,
  formatDuration,
  isMissingResolution,
  isValidTitle,
} from "@/features/tickets/utils";

const TYPE_OPTIONS = TICKET_TYPES.map((value) => ({ value }));

// Botones rápidos según el estado elegido: solo eligen el estado.
const QUICK_ACTIONS: Record<TicketStatus, TicketStatus[]> = {
  Abierto: ["En curso", "Cerrado"],
  "En curso": ["En espera", "Cerrado"],
  "En espera": ["En curso", "Cerrado"],
  Cerrado: ["Abierto"],
};

const QUICK_LABELS: Record<TicketStatus, string> = {
  "En curso": "Tomar",
  "En espera": "Poner en espera",
  Cerrado: "Resolver y cerrar",
  Abierto: "Reabrir",
};

const CHANGE_LABELS: [keyof TicketFormValues, string][] = [
  ["title", "nombre"],
  ["type", "tipo"],
  ["description", "descripción"],
  ["projectId", "proyecto"],
  ["requesterId", "solicitante"],
  ["status", "estado"],
  ["priority", "prioridad"],
  ["dueDate", "fecha límite"],
];

function toFormValues(ticket: Ticket, today: string): TicketFormValues {
  return {
    title: ticket.title,
    type: ticket.type,
    description: ticket.description,
    projectId: ticket.projectId,
    requesterId: ticket.requesterId,
    status: ticket.status,
    priority: ticket.priority,
    dueDate: ticket.dueInDays === null ? "" : addDays(today, ticket.dueInDays),
    waitingFor: ticket.waitingFor,
    resolution: "",
  };
}

/** Si cambia el estado, la espera no cuenta como cambio aparte. */
function isWaitingModified(
  values: TicketFormValues,
  original: TicketFormValues,
) {
  return (
    values.status === original.status &&
    values.status === "En espera" &&
    values.waitingFor !== original.waitingFor
  );
}

function getChanges(
  values: TicketFormValues,
  original: TicketFormValues,
): TicketChange[] {
  const changes = CHANGE_LABELS.filter(
    ([field]) => values[field] !== original[field],
  ).map(([field, label]) => ({
    field,
    label:
      field === "status"
        ? `estado (${original.status} → ${values.status})`
        : label,
  }));
  return isWaitingModified(values, original)
    ? [...changes, { field: "waitingFor", label: "espera" }]
    : changes;
}

/**
 * `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás.
 * La fecha límite depende del día del navegador: sin él, no hay formulario.
 */
export function TicketEditForm({ ticket }: { ticket: Ticket }) {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando ticket…
        </p>
      </div>
    );
  }
  return <EditForm key={bfcacheId} ticket={ticket} today={today} />;
}

function EditForm({ ticket, today }: { ticket: Ticket; today: string }) {
  const [original, setOriginal] = useState(() => toFormValues(ticket, today));
  const [values, setValues] = useState(original);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");
  const [activity, setActivity] = useState(ticket.activity);
  const [deleted, setDeleted] = useState(false);

  const changes = getChanges(values, original);
  const missingResolution = isMissingResolution(values, original.status);
  const isValid = isValidTitle(values.title) && !missingResolution;

  const errors: TicketFormErrors = {};
  if (tried && !isValidTitle(values.title)) {
    errors.title = "Usa al menos 6 caracteres.";
  }
  if (tried && missingResolution) {
    errors.resolution = "Escribe la resolución para cerrar el ticket.";
  }

  function change(patch: Partial<TicketFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function save() {
    if (!isValid) {
      setTried(true);
      return;
    }
    const closed = values.status === "Cerrado" && original.status !== "Cerrado";
    const saved: TicketFormValues = {
      ...values,
      resolution: "",
      waitingFor: values.status === "En espera" ? values.waitingFor : "",
    };
    setActivity([...getSaveEntries(values, original, changes), ...activity]);
    setOriginal(saved);
    setValues(saved);
    setTried(false);
    setNotice(
      closed
        ? `${ticket.code} cerrado. La resolución quedó en la actividad.`
        : `Cambios guardados (${changes.length}).`,
    );
  }

  function deleteTicket() {
    setDeleted(true);
    setNotice(`${ticket.code} eliminado.`);
  }

  function discard() {
    setValues(original);
    setTried(false);
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <EditHeader
        ticket={ticket}
        original={original}
        status={values.status}
        canSave={changes.length > 0 && !deleted}
        disabled={deleted}
        onStatusChange={(status) => change({ status })}
      />

      {changes.length > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
        >
          <span className="size-2 rounded-full bg-accent" />
          <span className="min-w-0 flex-[1_1_220px]">
            <strong>
              {changes.length === 1 ? "1 cambio" : `${changes.length} cambios`}
            </strong>{" "}
            sin guardar: {changes.map(({ label }) => label).join(", ")}
          </span>
          <button
            type="button"
            className="crm-btn crm-btn-sm crm-btn-secondary"
            disabled={deleted}
            onClick={discard}
          >
            Descartar
          </button>
        </div>
      )}

      {notice && (
        <Alert
          variant="success"
          action={
            deleted && (
              <Link
                href="/tickets"
                className="crm-hit font-bold text-tone-green-fg underline"
              >
                Ver listado
              </Link>
            )
          }
          onClose={deleted ? undefined : () => setNotice("")}
        >
          {notice}
        </Alert>
      )}

      {tried && !isValid && (
        <Alert variant="danger">
          {missingResolution
            ? "Para cerrar el ticket, describe cómo se resolvió (mínimo 10 caracteres)."
            : "Revisa los campos marcados antes de guardar."}
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <fieldset
            role="presentation"
            disabled={deleted}
            className="flex min-w-0 flex-col gap-6"
          >
            <StatusFields
              values={values}
              errors={errors}
              original={original}
              waitingModified={isWaitingModified(values, original)}
              today={today}
              onChange={change}
            />
            <DetailSection
              values={values}
              errors={errors}
              original={original}
              onChange={change}
            />
          </fieldset>
          <TicketActivity
            activity={activity}
            disabled={deleted}
            onChange={setActivity}
          />
          <TicketDangerZone disabled={deleted} onDelete={deleteTicket} />
        </div>
        <TicketSidebar
          ticket={ticket}
          values={values}
          savedStatus={original.status}
          activity={activity}
        />
      </div>
    </form>
  );
}

function EditHeader({
  ticket,
  original,
  status,
  canSave,
  disabled,
  onStatusChange,
}: {
  ticket: Ticket;
  original: TicketFormValues;
  status: TicketStatus;
  canSave: boolean;
  disabled: boolean;
  onStatusChange: (status: TicketStatus) => void;
}) {
  const opening = ticket.activity[ticket.activity.length - 1];
  const project = findProjectById(original.projectId);
  const priorityTone =
    TICKET_PRIORITIES.find(({ value }) => value === original.priority)?.tone ??
    "blue";

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Operación" },
          { label: "Tickets", href: "/tickets" },
          { label: ticket.code },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md bg-ink px-2 py-[3px] font-mono text-compact font-medium text-white">
              {ticket.code}
            </span>
            <TicketStatusBadge status={original.status} />
            <span className="flex items-center gap-1.5 text-compact font-semibold text-ink-soft">
              <span
                className={`size-2 rounded-full ${TONE_DOT_CLASSES[priorityTone]}`}
              />
              Prioridad {original.priority.toLowerCase()}
            </span>
          </div>
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
            {original.title}
          </h1>
          <span className="text-sm text-ink-muted">
            Abierto hace {formatDuration(opening.hoursAgo)} por {opening.author}
            {project && (
              <>
                {" · "}
                <span className="font-semibold text-ink-soft">
                  <span className="font-mono">{project.code}</span>{" "}
                  {project.name}
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS[status].map((target) => (
            <button
              key={target}
              type="button"
              className="crm-btn crm-btn-secondary"
              disabled={disabled}
              onClick={() => onStatusChange(target)}
            >
              <span
                className={`size-2 rounded-full ${TONE_DOT_CLASSES[TICKET_STATUS_TONES[target]]}`}
              />
              {QUICK_LABELS[target]}
            </button>
          ))}
          <button
            type="submit"
            className="crm-btn crm-btn-primary"
            disabled={!canSave}
          >
            <CheckIcon />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  values,
  errors,
  original,
  onChange,
}: {
  values: TicketFormValues;
  errors: TicketFormErrors;
  original: TicketFormValues;
  onChange: (patch: Partial<TicketFormValues>) => void;
}) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Detalle
      </h2>
      <TextField
        label="Nombre del ticket"
        value={values.title}
        error={errors.title}
        modified={values.title !== original.title}
        onChange={(event) => onChange({ title: event.target.value })}
      />
      <PillRadioGroup
        label="Tipo"
        options={TYPE_OPTIONS}
        value={values.type}
        modified={values.type !== original.type}
        onChange={(type) => onChange({ type })}
      />
      <div className="flex flex-col gap-1.5">
        <FieldLabel
          htmlFor={`${id}-description`}
          modified={values.description !== original.description}
        >
          Descripción
        </FieldLabel>
        <textarea
          id={`${id}-description`}
          rows={4}
          className="crm-textarea"
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </div>
      <ProjectFields
        values={values}
        errors={errors}
        original={original}
        onChange={onChange}
      />
    </section>
  );
}
