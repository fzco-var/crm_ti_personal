"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { TONE_CLASSES } from "@/components/tone";
import { findProjectById, getProjectCompany } from "@/features/projects/utils";
import { TICKET_STATUS_TONES } from "@/features/tickets/constants";
import type {
  Ticket,
  TicketActivity,
  TicketFormValues,
  TicketStatus,
} from "@/features/tickets/types/ticket";
import {
  formatDuration,
  formatHoursAgo,
  getTicketsByProject,
} from "@/features/tickets/utils";

/**
 * Detalles y tickets relacionados. Cliente, tipo y relacionados siguen a los
 * valores del formulario; "Tiempo abierto", al estado guardado.
 */
export function TicketSidebar({
  ticket,
  values,
  savedStatus,
  activity,
}: {
  ticket: Ticket;
  values: TicketFormValues;
  savedStatus: TicketStatus;
  activity: TicketActivity[];
}) {
  const project = findProjectById(values.projectId);
  const opening = ticket.activity[ticket.activity.length - 1];

  return (
    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
      <Panel title="Detalles">
        <dl className="flex flex-col gap-3 text-compact">
          {savedStatus !== "Cerrado" && (
            <DetailItem
              label="Tiempo abierto"
              className="font-mono font-medium"
            >
              {formatDuration(opening.hoursAgo)}
            </DetailItem>
          )}
          <DetailItem label="Última actividad">
            {formatHoursAgo(activity[0].hoursAgo)}
          </DetailItem>
          <DetailItem label="Cliente" className="text-right font-semibold">
            {project ? getProjectCompany(project) : "—"}
          </DetailItem>
          <DetailItem label="Tipo" className="font-semibold">
            {values.type}
          </DetailItem>
        </dl>
      </Panel>
      {project && (
        <RelatedPanel
          ticketId={ticket.id}
          projectId={project.id}
          projectCode={project.code}
        />
      )}
    </aside>
  );
}

function Panel({ title, children }: { title: ReactNode; children: ReactNode }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3.5 p-6">
      <h2 id={headingId} className="text-base font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailItem({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={className}>{children}</dd>
    </div>
  );
}

function RelatedPanel({
  ticketId,
  projectId,
  projectCode,
}: {
  ticketId: string;
  projectId: string;
  projectCode: string;
}) {
  const related = getTicketsByProject(projectId).filter(
    ({ id }) => id !== ticketId,
  );

  return (
    <Panel
      title={
        <>
          Otros tickets de{" "}
          <Link href={`/projects/${projectId}`} className="crm-link font-bold">
            {projectCode}
          </Link>
        </>
      }
    >
      {related.length > 0 ? (
        <ul className="-mt-1 flex flex-col gap-0.5">
          {related.map(({ id, code, title, status }) => (
            <li key={id}>
              <Link
                href={`/tickets/${id}`}
                className="-mx-2 flex flex-col gap-1 rounded-control px-2 py-2.5 text-ink hover:bg-surface-hover"
              >
                <span className="flex justify-between gap-2">
                  <span className="font-mono text-xs text-ink-muted">
                    {code}
                  </span>
                  <span
                    className={`crm-badge h-5 px-2 text-2xs ${TONE_CLASSES[TICKET_STATUS_TONES[status]]}`}
                  >
                    {status}
                  </span>
                </span>
                <span className="text-compact font-semibold">{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-compact text-ink-muted">
          No hay otros tickets en este proyecto.
        </span>
      )}
    </Panel>
  );
}
