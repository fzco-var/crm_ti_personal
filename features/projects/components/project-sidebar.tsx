"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { TONE_CLASSES } from "@/components/tone";
import { ProjectTimeline } from "@/features/projects/components/project-timeline";
import type {
  ProjectFormValues,
  ProjectHistoryEntry,
} from "@/features/projects/types/project";
import {
  formatHistoryEntry,
  getTimelinePercent,
  isEndBeforeStart,
} from "@/features/projects/utils";
import { TICKET_STATUS_TONES } from "@/features/tickets/constants";
import { getDaysUntil, getTicketsByProject } from "@/features/tickets/utils";

/** Avance, tickets e historial. El avance sigue a los valores del formulario. */
export function ProjectSidebar({
  projectId,
  values,
  history,
  today,
}: {
  projectId: string;
  values: ProjectFormValues;
  history: ProjectHistoryEntry[];
  today: string;
}) {
  return (
    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
      <ProgressPanel values={values} today={today} />
      <TicketsPanel projectId={projectId} />
      <Panel title="Historial" className="gap-2">
        <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-compact leading-[1.45] text-ink-soft">
          {history.map((entry, index) => (
            <li key={index}>{formatHistoryEntry(entry, today)}</li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
}

function Panel({
  title,
  action,
  className = "gap-4",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`crm-card p-6 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-base font-bold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Completado dice "Listo"; si no, quedan o sobran días hasta el término. */
function getDeadline(values: ProjectFormValues, today: string) {
  if (values.status === "Completado") {
    return { label: "Estado", value: "Listo", className: "text-success" };
  }
  if (!values.endDate) {
    return { label: "Quedan", value: "—", className: "text-ink" };
  }
  const days = getDaysUntil(values.endDate, today);
  if (days < 0) {
    return { label: "Atrasado", value: `${-days} d`, className: "text-danger" };
  }
  return {
    label: "Quedan",
    value: `${days} d`,
    className: days <= 7 ? "text-warning" : "text-ink",
  };
}

function ProgressPanel({
  values,
  today,
}: {
  values: ProjectFormValues;
  today: string;
}) {
  const done = values.milestones.filter((milestone) => milestone.done).length;
  const deadline = getDeadline(values, today);
  const hasRange =
    Boolean(values.startDate && values.endDate) &&
    !isEndBeforeStart(values.startDate, values.endDate);
  const elapsed = hasRange
    ? getTimelinePercent(today, values.startDate, values.endDate)
    : 0;

  return (
    <Panel title="Avance">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Hitos hechos">
          {done}/{values.milestones.length}
        </Stat>
        <Stat label={deadline.label} className={deadline.className}>
          {deadline.value}
        </Stat>
      </div>
      <div className="flex flex-col gap-2">
        <span className="flex justify-between text-xs text-ink-muted">
          <span>Tiempo transcurrido</span>
          <span className="font-mono">{elapsed}%</span>
        </span>
        {hasRange && (
          <ProjectTimeline
            startDate={values.startDate}
            endDate={values.endDate}
            today={today}
            milestones={values.milestones}
            variant="progress"
          />
        )}
      </div>
    </Panel>
  );
}

function Stat({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-surface-muted p-3">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className={`font-mono text-[22px] font-medium ${className}`}>
        {children}
      </span>
    </div>
  );
}

function TicketsPanel({ projectId }: { projectId: string }) {
  const projectTickets = getTicketsByProject(projectId);

  return (
    <Panel
      title="Tickets del proyecto"
      className="gap-3"
      action={
        <Link
          href={`/tickets?project=${projectId}`}
          className="crm-link crm-hit text-compact font-bold"
        >
          Ver todos
        </Link>
      }
    >
      {projectTickets.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {projectTickets.map(({ id, code, title, status }) => (
            <li key={id}>
              <Link
                href={`/tickets/${id}`}
                className="flex flex-col gap-1 rounded-control bg-surface-muted px-3 py-2.5 text-ink hover:bg-surface-hover"
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
        <span className="text-compact text-ink-muted">Sin tickets.</span>
      )}
    </Panel>
  );
}
