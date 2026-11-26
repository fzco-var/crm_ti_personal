"use client";

import Link from "next/link";
import { ChevronDownIcon, MoreIcon, PencilIcon } from "@/components/icons";
import { projects } from "@/data/projects";
import type { Project } from "@/features/projects/types/project";
import { TicketStatusSelect } from "@/features/tickets/components/ticket-status-select";
import { TICKET_STATUSES } from "@/features/tickets/constants";
import type { Ticket, TicketStatus } from "@/features/tickets/types/ticket";
import { formatHoursAgo } from "@/features/tickets/utils";

export type SortKey = "title" | "project" | "status";

export interface TicketsSort {
  key: SortKey;
  direction: "ascending" | "descending";
}

export type TicketsView = "list" | "project";

const COLUMNS: { label: string; sortKey: SortKey; className: string }[] = [
  { label: "Nombre del ticket", sortKey: "title", className: "" },
  { label: "Proyecto", sortKey: "project", className: "w-[38%]" },
  { label: "Estado", sortKey: "status", className: "w-[150px]" },
];

const PROJECTS_BY_ID = new Map(
  projects.map((project) => [project.id, project]),
);

/** Todo ticket de ejemplo apunta a un proyecto de `data/projects.ts`. */
function getProject({ projectId }: Ticket) {
  return PROJECTS_BY_ID.get(projectId) as Project;
}

function compareStatus(a: Ticket, b: Ticket) {
  return TICKET_STATUSES.indexOf(a.status) - TICKET_STATUSES.indexOf(b.status);
}

function compareProject(a: Ticket, b: Ticket) {
  return getProject(a).code.localeCompare(getProject(b).code);
}

/** Desempata por la última actualización, la más reciente primero. */
function sortTickets(
  tickets: Ticket[],
  { key, direction }: TicketsSort,
  getHoursAgo: (ticket: Ticket) => number,
) {
  const byUpdate = (a: Ticket, b: Ticket) => getHoursAgo(a) - getHoursAgo(b);
  const compare = {
    title: (a: Ticket, b: Ticket) => a.title.localeCompare(b.title, "es"),
    project: (a: Ticket, b: Ticket) => compareProject(a, b) || byUpdate(a, b),
    status: (a: Ticket, b: Ticket) => compareStatus(a, b) || byUpdate(a, b),
  }[key];
  const sign = direction === "ascending" ? 1 : -1;
  return [...tickets].sort((a, b) => compare(a, b) * sign);
}

/** Por código de proyecto y, dentro de cada uno, por estado. */
function groupByProject(tickets: Ticket[]) {
  const groups = new Map<string, Ticket[]>();
  const sorted = [...tickets].sort(
    (a, b) => compareProject(a, b) || compareStatus(a, b),
  );
  for (const ticket of sorted) {
    groups.set(ticket.projectId, [
      ...(groups.get(ticket.projectId) ?? []),
      ticket,
    ]);
  }
  return [...groups.values()];
}

type RowProps = {
  getHoursAgo: (ticket: Ticket) => number;
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void;
};

/**
 * `allTickets` da el resumen de cada grupo. `updatedIds` son los tickets
 * cambiados en el listado: dicen "actualizado recién".
 */
export function TicketsTable({
  tickets,
  allTickets,
  updatedIds,
  view,
  sort,
  onSortChange,
  onStatusChange,
}: {
  tickets: Ticket[];
  allTickets: Ticket[];
  updatedIds: ReadonlySet<string>;
  view: TicketsView;
  sort: TicketsSort;
  onSortChange: (sort: TicketsSort) => void;
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void;
}) {
  const rowProps: RowProps = {
    getHoursAgo: (ticket) =>
      updatedIds.has(ticket.id) ? 0 : ticket.activity[0].hoursAgo,
    onStatusChange,
  };

  return (
    <div className="crm-table-wrap">
      <table className="crm-table min-w-[760px]">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <SortableHeader
                key={column.sortKey}
                {...column}
                sort={view === "list" ? sort : undefined}
                onSortChange={onSortChange}
              />
            ))}
            {/* `relative` evita que el texto oculto desborde la página. */}
            <th scope="col" className="relative w-[88px]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        {view === "list" ? (
          <tbody>
            {sortTickets(tickets, sort, rowProps.getHoursAgo).map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} {...rowProps} />
            ))}
          </tbody>
        ) : (
          groupByProject(tickets).map((group) => (
            <ProjectGroup
              key={group[0].projectId}
              tickets={group}
              allTickets={allTickets}
              {...rowProps}
            />
          ))
        )}
      </table>
    </div>
  );
}

/** Sin `sort`, en "Por proyecto", ninguna columna está ordenada. */
function SortableHeader({
  label,
  sortKey,
  className,
  sort,
  onSortChange,
}: {
  label: string;
  sortKey: SortKey;
  className: string;
  sort?: TicketsSort;
  onSortChange: (sort: TicketsSort) => void;
}) {
  const active = sort?.key === sortKey;
  const descending = active && sort.direction === "descending";

  return (
    <th
      scope="col"
      aria-sort={active ? sort.direction : "none"}
      className={`whitespace-nowrap ${className}`}
    >
      <button
        type="button"
        className={`crm-sort ${active ? "text-ink" : ""}`}
        onClick={() =>
          onSortChange({
            key: sortKey,
            direction: active && !descending ? "descending" : "ascending",
          })
        }
      >
        {label}
        <ChevronDownIcon
          className={`${active ? "" : "opacity-35"} ${descending ? "rotate-180" : ""}`}
        />
      </button>
    </th>
  );
}

function ProjectGroup({
  tickets,
  allTickets,
  ...rowProps
}: RowProps & { tickets: Ticket[]; allTickets: Ticket[] }) {
  const project = getProject(tickets[0]);
  const projectTickets = allTickets.filter(
    ({ projectId }) => projectId === project.id,
  );
  const activeCount = projectTickets.filter(
    ({ status }) => status !== "Cerrado",
  ).length;

  return (
    <tbody>
      <tr>
        <th
          scope="rowgroup"
          colSpan={4}
          className="bg-surface-muted px-5 py-3 font-normal"
        >
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-xs font-medium text-white">
              {project.code}
            </span>
            <Link
              href={`/projects/${project.id}`}
              className="font-bold text-ink underline-offset-[3px] hover:underline"
            >
              {project.name}
            </Link>
            <span className="text-xs text-ink-muted">
              {activeCount === 1 ? "1 activo" : `${activeCount} activos`} de{" "}
              {projectTickets.length}
            </span>
          </span>
        </th>
      </tr>
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} {...rowProps} />
      ))}
    </tbody>
  );
}

function TicketRow({
  ticket,
  getHoursAgo,
  onStatusChange,
}: RowProps & { ticket: Ticket }) {
  const project = getProject(ticket);
  const hoursAgo = getHoursAgo(ticket);
  const closed = ticket.status === "Cerrado";

  return (
    <tr>
      <th scope="row" className="pl-5">
        <span className="flex flex-col gap-0.5">
          <Link
            href={`/tickets/${ticket.id}`}
            className={`font-bold underline-offset-[3px] hover:underline ${closed ? "text-ink-muted line-through" : "text-ink"}`}
          >
            {ticket.title}
          </Link>
          <span className="flex flex-wrap gap-2 text-xs text-ink-muted">
            <span className="font-bold text-ink-soft">{ticket.type}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{ticket.code}</span>
            <span aria-hidden="true">·</span>
            <span>
              {hoursAgo === 0 ? "actualizado recién" : formatHoursAgo(hoursAgo)}
            </span>
          </span>
        </span>
      </th>
      <td>
        <span className="flex items-center gap-2.5">
          <span className="flex-none rounded-md border border-line bg-surface-muted px-2 py-0.5 font-mono text-xs font-medium text-ink-soft">
            {project.code}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="text-ink underline-offset-[3px] hover:underline"
          >
            {project.name}
          </Link>
        </span>
      </td>
      <td className="py-1.5 whitespace-nowrap">
        <TicketStatusSelect
          code={ticket.code}
          status={ticket.status}
          onChange={(status) => onStatusChange(ticket, status)}
        />
      </td>
      <td className="py-2 pr-5 pl-2">
        <span className="flex justify-end gap-1">
          <Link
            href={`/tickets/${ticket.id}`}
            className="crm-icon-btn"
            aria-label={`Editar ${ticket.code}`}
          >
            <PencilIcon />
          </Link>
          <button
            type="button"
            className="crm-icon-btn"
            aria-label={`Más acciones para ${ticket.code}`}
            disabled
          >
            <MoreIcon />
          </button>
        </span>
      </td>
    </tr>
  );
}
