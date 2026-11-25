"use client";

import { useId, type ReactNode } from "react";
import { TONE_DOT_CLASSES } from "@/components/tone";
import { clients } from "@/data/clients";
import { findProjectById } from "@/features/projects/utils";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import { TICKET_PRIORITIES } from "@/features/tickets/constants";
import type { TicketFormValues } from "@/features/tickets/types/ticket";
import { formatDate } from "@/features/tickets/utils";

function getRequesterName(requesterId: string | null) {
  if (requesterId === null) return "Yo";
  const client = clients.find(({ id }) => id === requesterId);
  return client ? `${client.firstName} ${client.lastName}` : "—";
}

export function TicketPreview({
  code,
  values,
}: {
  code: string;
  values: TicketFormValues;
}) {
  const headingId = useId();
  const project = findProjectById(values.projectId);
  const priorityTone =
    TICKET_PRIORITIES.find(({ value }) => value === values.priority)?.tone ??
    "blue";
  const projectCode = project?.code ?? "PRJ-···";

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Así se verá en el listado
      </h2>
      <div className="flex flex-col gap-3 rounded-xl border border-line-soft p-3.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-sm leading-[1.35] font-bold">
            {values.title.trim() || "Nombre del ticket"}
          </span>
          <span className="font-mono text-xs text-ink-muted">
            {code} · recién creado
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex-none rounded-md border border-line bg-surface-muted px-2 py-0.5 font-mono text-xs font-medium text-ink-soft">
            {projectCode}
          </span>
          <span className="truncate text-compact">
            {project?.name ?? "Sin proyecto elegido"}
          </span>
        </span>
        <span className="self-start">
          <TicketStatusBadge status={values.status} />
        </span>
      </div>
      <dl className="flex flex-col gap-2.5 text-compact">
        <PreviewItem label="Tipo" className="font-semibold">
          {values.type}
        </PreviewItem>
        <PreviewItem
          label="Prioridad"
          className="flex items-center gap-1.5 font-semibold"
        >
          <span
            className={`size-2 rounded-full ${TONE_DOT_CLASSES[priorityTone]}`}
          />
          {values.priority}
        </PreviewItem>
        <PreviewItem label="Solicitado por" className="font-semibold">
          {project ? getRequesterName(values.requesterId) : "—"}
        </PreviewItem>
        <PreviewItem label="Fecha límite" className="font-mono">
          {values.dueDate ? formatDate(values.dueDate) : "Sin fecha"}
        </PreviewItem>
      </dl>
      <div className="flex flex-col gap-1.5 border-t border-line-soft pt-4 text-compact leading-[1.45] text-ink-soft">
        <span className="font-bold text-ink">Al crear</span>
        <span>
          Aparecerá en Tickets y en la ficha del proyecto {projectCode}.
        </span>
      </div>
    </aside>
  );
}

function PreviewItem({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`text-right ${className}`}>{children}</dd>
    </div>
  );
}
