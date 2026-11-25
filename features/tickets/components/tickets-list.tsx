"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  ListIcon,
  PlusIcon,
  ProjectsIcon,
  SearchIcon,
  TicketsIcon,
} from "@/components/icons";
import { TONE_DOT_CLASSES } from "@/components/tone";
import { projects } from "@/data/projects";
import {
  TicketsTable,
  type TicketsSort,
  type TicketsView,
} from "@/features/tickets/components/tickets-table";
import {
  TICKET_STATUSES,
  TICKET_STATUS_TONES,
} from "@/features/tickets/constants";
import type { Ticket, TicketStatus } from "@/features/tickets/types/ticket";
import { normalizeText } from "@/lib/text";

type StatusFilter = TicketStatus | "Sin cerrar" | "Todos";

const STATUS_FILTERS: StatusFilter[] = [
  "Sin cerrar",
  ...TICKET_STATUSES,
  "Todos",
];

const SUMMARY_TILES: { label: string; status: TicketStatus }[] = [
  { label: "Abiertos", status: "Abierto" },
  { label: "En curso", status: "En curso" },
  { label: "En espera", status: "En espera" },
  { label: "Cerrados", status: "Cerrado" },
];

const PROJECT_OPTIONS = [...projects].sort((a, b) =>
  a.code.localeCompare(b.code),
);

/** Estados cambiados en el listado; "Deshacer" vuelve a la versión anterior. */
interface ListState {
  tickets: Ticket[];
  updatedIds: ReadonlySet<string>;
}

function filterByStatus(tickets: Ticket[], filter: StatusFilter) {
  if (filter === "Todos") return tickets;
  if (filter === "Sin cerrar") {
    return tickets.filter(({ status }) => status !== "Cerrado");
  }
  return tickets.filter(({ status }) => status === filter);
}

function matchesSearch(ticket: Ticket, search: string) {
  const query = normalizeText(search);
  if (!query) return true;
  const project = projects.find(({ id }) => id === ticket.projectId);
  return normalizeText(
    [ticket.title, ticket.type, ticket.code, project?.code, project?.name].join(
      " ",
    ),
  ).includes(query);
}

function plural(count: number, singular: string, pluralText: string) {
  return `${count} ${count === 1 ? singular : pluralText}`;
}

function getSummary(tickets: Ticket[]) {
  if (tickets.length === 0) return "Todavía no hay tickets.";
  const open = filterByStatus(tickets, "Sin cerrar");
  const projectCount = new Set(open.map(({ projectId }) => projectId)).size;
  return `${open.length} sin cerrar en ${plural(projectCount, "proyecto", "proyectos")} · ${tickets.length} en total`;
}

export function TicketsList({ tickets }: { tickets: Ticket[] }) {
  const [list, setList] = useState<ListState>({
    tickets,
    updatedIds: new Set(),
  });
  const [undoState, setUndoState] = useState<ListState | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Sin cerrar");
  const [view, setView] = useState<TicketsView>("list");
  const [sort, setSort] = useState<TicketsSort>({
    key: "status",
    direction: "ascending",
  });

  // Al salir, Activity conserva el estado; el aviso es lo único que se cierra.
  useLayoutEffect(() => () => closeNotice(), []);

  const allTickets = list.tickets;
  const visibleTickets = filterByStatus(allTickets, statusFilter).filter(
    (ticket) =>
      (!projectId || ticket.projectId === projectId) &&
      matchesSearch(ticket, search),
  );
  const isEmpty = allTickets.length === 0;

  function closeNotice() {
    setNotice("");
    setUndoState(null);
  }

  function changeStatus(ticket: Ticket, status: TicketStatus) {
    if (status === ticket.status) return;
    setUndoState(list);
    setList({
      tickets: allTickets.map((other) =>
        other.id === ticket.id ? { ...other, status } : other,
      ),
      updatedIds: new Set(list.updatedIds).add(ticket.id),
    });
    setNotice(`${ticket.code} pasó de ${ticket.status} a ${status}.`);
  }

  function undo() {
    if (!undoState) return;
    setList(undoState);
    setUndoState(null);
    setNotice("Cambio deshecho.");
  }

  function changeSort(newSort: TicketsSort) {
    setSort(newSort);
    setView("list");
  }

  return (
    <div className="crm-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[{ label: "Operación" }, { label: "Tickets" }]} />
          <h1 className="crm-title">Tickets</h1>
          <p className="text-sm text-ink-muted">{getSummary(allTickets)}</p>
        </div>
        <Link href="/tickets/new" className="crm-btn crm-btn-primary">
          <PlusIcon />
          Nuevo ticket
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {SUMMARY_TILES.map(({ label, status }) => (
          <div key={status} className="crm-tile">
            <span className="flex items-center gap-2 text-compact font-semibold text-ink-soft">
              <span
                className={`size-2 rounded-full ${TONE_DOT_CLASSES[TICKET_STATUS_TONES[status]]}`}
              />
              {label}
            </span>
            <span className="font-mono text-[28px] leading-none font-medium">
              {filterByStatus(allTickets, status).length}
            </span>
          </div>
        ))}
      </div>

      {notice && (
        <Alert
          variant="success"
          onClose={closeNotice}
          action={
            undoState && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-secondary border-tone-green-line text-tone-green-fg"
                onClick={undo}
              >
                Deshacer
              </button>
            )
          }
        >
          {notice}
        </Alert>
      )}

      <section
        aria-label="Listado de tickets"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div className="flex flex-col gap-3 border-b border-line-soft px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex max-w-[360px] flex-[1_1_260px]">
              <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
              <label htmlFor="tickets-search" className="sr-only">
                Buscar tickets
              </label>
              <input
                id="tickets-search"
                type="search"
                className="crm-field crm-field-sm pl-[42px]"
                placeholder="Buscar por ticket, proyecto o ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-[0_1_260px] flex-col">
              <label htmlFor="tickets-project" className="sr-only">
                Filtrar por proyecto
              </label>
              <select
                id="tickets-project"
                className="crm-field crm-field-sm px-3"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="">Todos los proyectos</option>
                {PROJECT_OPTIONS.map(({ id, code, name }) => (
                  <option key={id} value={id}>
                    {code} · {name}
                  </option>
                ))}
              </select>
            </div>
            <div
              role="group"
              aria-label="Vista"
              className="crm-segmented ml-auto"
            >
              <button
                type="button"
                className="crm-segment"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <ListIcon />
                Lista
              </button>
              <button
                type="button"
                className="crm-segment"
                aria-pressed={view === "project"}
                onClick={() => setView("project")}
              >
                <ProjectsIcon size={14} strokeWidth={2} />
                Por proyecto
              </button>
            </div>
          </div>
          <div
            role="group"
            aria-label="Filtrar por estado"
            className="flex flex-wrap gap-1.5"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className="crm-chip"
                aria-pressed={filter === statusFilter}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
                <span className="font-mono text-xs opacity-75">
                  {filterByStatus(allTickets, filter).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {visibleTickets.length > 0 ? (
          <TicketsTable
            tickets={visibleTickets}
            allTickets={allTickets}
            updatedIds={list.updatedIds}
            view={view}
            sort={sort}
            onSortChange={changeSort}
            onStatusChange={changeStatus}
          />
        ) : (
          <EmptyState isEmpty={isEmpty} />
        )}

        <div className="border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          Mostrando {visibleTickets.length} de {allTickets.length} tickets
          {view === "project" && " · agrupados por proyecto"}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        <TicketsIcon size={22} />
      </span>
      <span className="text-base font-bold">
        {isEmpty ? "Aún no hay tickets" : "Sin resultados"}
      </span>
      <span className="max-w-[380px] text-sm leading-normal text-ink-muted">
        {isEmpty
          ? "Crea el primero con “Nuevo ticket” y vincúlalo a un proyecto."
          : "Ningún ticket coincide con la búsqueda o los filtros."}
      </span>
    </div>
  );
}
