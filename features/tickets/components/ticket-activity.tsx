"use client";

import { useId, useState } from "react";
import { findProjectById } from "@/features/projects/utils";
import type {
  TicketActivity as ActivityEntry,
  TicketFormValues,
} from "@/features/tickets/types/ticket";
import { formatHoursAgo } from "@/features/tickets/utils";

/** Un cambio sin guardar: el campo y su nombre en el aviso. */
export interface TicketChange {
  field: keyof TicketFormValues;
  label: string;
}

// Los campos con entrada propia; el resto va en "editó …".
const OWN_ENTRY_FIELDS: (keyof TicketFormValues)[] = [
  "status",
  "priority",
  "projectId",
];

/** Las entradas del usuario del CRM son de Martín Vidal, como en el menú. */
function createOwnEntry(action: string, text = ""): ActivityEntry {
  return {
    author: "Martín Vidal",
    initials: "MV",
    isOwn: true,
    action,
    hoursAgo: 0,
    text,
  };
}

function getStatusText(values: TicketFormValues) {
  if (values.status === "Cerrado") {
    return `Resolución: ${values.resolution.trim()}`;
  }
  if (values.status === "En espera" && values.waitingFor.trim()) {
    return `Esperando: ${values.waitingFor.trim()}`;
  }
  return "";
}

/** Entradas al guardar, de la más reciente a la más antigua. */
export function getSaveEntries(
  values: TicketFormValues,
  original: TicketFormValues,
  changes: TicketChange[],
): ActivityEntry[] {
  const changed = new Set(changes.map(({ field }) => field));
  const entries: ActivityEntry[] = [];

  if (changed.has("status")) {
    entries.push(
      createOwnEntry(
        `cambió el estado de ${original.status} a ${values.status}`,
        getStatusText(values),
      ),
    );
  }
  if (changed.has("priority")) {
    entries.push(
      createOwnEntry(
        `cambió la prioridad de ${original.priority} a ${values.priority}`,
      ),
    );
  }
  if (changed.has("projectId")) {
    const from = findProjectById(original.projectId)?.code;
    const to = findProjectById(values.projectId)?.code;
    entries.push(createOwnEntry(`movió el ticket de ${from} a ${to}`));
  }
  const others = changes.filter(
    ({ field }) => !OWN_ENTRY_FIELDS.includes(field),
  );
  if (others.length > 0) {
    entries.push(
      createOwnEntry(`editó ${others.map(({ label }) => label).join(", ")}`),
    );
  }
  return entries.reverse();
}

/** "Agregar nota" actúa al instante, sin guardar el formulario. */
export function TicketActivity({
  activity,
  disabled,
  onChange,
}: {
  activity: ActivityEntry[];
  disabled?: boolean;
  onChange: (activity: ActivityEntry[]) => void;
}) {
  const id = useId();
  const [note, setNote] = useState("");

  function addNote() {
    if (!note.trim()) return;
    onChange([createOwnEntry("agregó una nota", note.trim()), ...activity]);
    setNote("");
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <h2 id={`${id}-heading`} className="crm-heading">
        Actividad
      </h2>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-note`} className="crm-label">
          Agregar nota
        </label>
        <textarea
          id={`${id}-note`}
          rows={2}
          className="crm-textarea text-sm"
          placeholder="Lo que probaste, lo que te dijo el cliente, próximos pasos…"
          value={note}
          disabled={disabled}
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          type="button"
          className="crm-btn crm-btn-md crm-btn-secondary self-end"
          disabled={disabled || !note.trim()}
          onClick={addNote}
        >
          Agregar nota
        </button>
      </div>
      <ol className="flex flex-col">
        {activity.map((entry, index) => (
          <ActivityItem key={activity.length - index} entry={entry} />
        ))}
      </ol>
    </section>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <li className="flex gap-3.5">
      <span
        aria-hidden="true"
        className="flex w-7 flex-none flex-col items-center"
      >
        <span
          className={`flex size-7 items-center justify-center rounded-full font-mono text-2xs font-medium ${entry.isOwn ? "bg-ink text-ink-inverse" : "bg-canvas text-ink-soft"}`}
        >
          {entry.initials}
        </span>
        <span className="min-h-3.5 w-0.5 flex-1 bg-line-soft" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 pb-[18px]">
        <span className="flex flex-wrap items-baseline gap-2 text-compact">
          <strong>{entry.author}</strong>
          <span className="text-ink-soft">{entry.action}</span>
          <span className="text-ink-muted">
            · {formatHoursAgo(entry.hoursAgo)}
          </span>
        </span>
        {entry.text && (
          <span className="rounded-control bg-surface-muted px-3 py-2.5 text-sm leading-normal">
            {entry.text}
          </span>
        )}
      </span>
    </li>
  );
}
