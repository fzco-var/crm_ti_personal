"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { PlusIcon, ProjectsIcon, SearchIcon } from "@/components/icons";
import { TONE_DOT_CLASSES, type Tone } from "@/components/tone";
import { useToday } from "@/components/use-today";
import {
  PROJECT_COLUMNS,
  ProjectsTable,
} from "@/features/projects/components/projects-table";
import { PROJECT_STATUSES } from "@/features/projects/constants";
import type { Project, ProjectStatus } from "@/features/projects/types/project";
import {
  type ProjectsSort,
  formatProjectCount,
  isDueSoon,
  isOverdue,
  matchesProjectSearch,
} from "@/features/projects/utils";

type StatusFilter = ProjectStatus | "Todos";

const STATUS_FILTERS: StatusFilter[] = ["Todos", ...PROJECT_STATUSES];

const SUMMARY_TILES: {
  label: string;
  tone: Tone;
  count: (projects: Project[]) => number;
}[] = [
  {
    label: "En curso",
    tone: "blue",
    count: (list) => filterByStatus(list, "En curso").length,
  },
  {
    label: "Atrasados",
    tone: "red",
    count: (list) => list.filter(isOverdue).length,
  },
  {
    label: "Vencen en 7 días",
    tone: "amber",
    count: (list) => list.filter(isDueSoon).length,
  },
  {
    label: "Completados",
    tone: "green",
    count: (list) => filterByStatus(list, "Completado").length,
  },
];

function filterByStatus(projects: Project[], filter: StatusFilter) {
  if (filter === "Todos") return projects;
  return projects.filter(({ status }) => status === filter);
}

function getSummary(projects: Project[]) {
  if (projects.length === 0) return "Todavía no hay proyectos.";
  const active = projects.filter(({ status }) => status !== "Completado");
  return `${formatProjectCount(projects.length)} · ${active.length} ${active.length === 1 ? "activo" : "activos"}`;
}

/** Activity conserva búsqueda, filtros y orden al volver al listado. */
export function ProjectsList({ projects }: { projects: Project[] }) {
  const today = useToday();
  const searchId = useId();
  const overdueId = useId();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [sort, setSort] = useState<ProjectsSort>({
    key: "end",
    direction: "ascending",
  });

  const visibleProjects = filterByStatus(projects, statusFilter).filter(
    (project) =>
      (!onlyOverdue || isOverdue(project)) &&
      matchesProjectSearch(project, search),
  );
  const isEmpty = projects.length === 0;
  const sortLabel = PROJECT_COLUMNS.find(
    ({ sortKey }) => sortKey === sort.key,
  )?.label.toLowerCase();

  return (
    <div className="crm-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[{ label: "Operación" }, { label: "Proyectos" }]}
          />
          <h1 className="crm-title">Proyectos</h1>
          <p className="text-sm text-ink-muted">{getSummary(projects)}</p>
        </div>
        <Link href="/projects/new" className="crm-btn crm-btn-primary">
          <PlusIcon />
          Nuevo proyecto
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {SUMMARY_TILES.map(({ label, tone, count }) => (
          <div key={label} className="crm-tile">
            <span className="flex items-center gap-2 text-compact font-semibold text-ink-soft">
              <span
                className={`size-2 rounded-full ${TONE_DOT_CLASSES[tone]}`}
              />
              {label}
            </span>
            <span className="font-mono text-[28px] leading-none font-medium">
              {count(projects)}
            </span>
          </div>
        ))}
      </div>

      <section
        aria-label="Listado de proyectos"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="relative flex max-w-[380px] flex-[1_1_280px]">
            <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
            <label htmlFor={searchId} className="sr-only">
              Buscar proyectos
            </label>
            <input
              id={searchId}
              type="search"
              className="crm-field crm-field-sm pl-[42px]"
              placeholder="Buscar por proyecto o cliente"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
                    {filterByStatus(projects, filter).length}
                  </span>
                </button>
              ))}
            </div>
            <label
              htmlFor={overdueId}
              className="flex min-h-9 cursor-pointer items-center gap-2 text-compact font-semibold"
            >
              <input
                id={overdueId}
                type="checkbox"
                className="size-[18px] accent-danger"
                checked={onlyOverdue}
                onChange={(event) => setOnlyOverdue(event.target.checked)}
              />
              Solo atrasados
            </label>
          </div>
        </div>

        {visibleProjects.length > 0 ? (
          <ProjectsTable
            projects={visibleProjects}
            sort={sort}
            today={today}
            onSortChange={setSort}
          />
        ) : (
          <EmptyState isEmpty={isEmpty} />
        )}

        <div className="border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          Mostrando {visibleProjects.length} de {projects.length} proyectos ·
          ordenados por {sortLabel}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        <ProjectsIcon size={22} />
      </span>
      <span className="text-base font-bold">
        {isEmpty ? "Aún no hay proyectos" : "Sin resultados"}
      </span>
      <span className="max-w-[380px] text-sm leading-normal text-ink-muted">
        {isEmpty
          ? "Crea el primero con “Nuevo proyecto” y asígnalo a un cliente."
          : "Ningún proyecto coincide con la búsqueda o los filtros."}
      </span>
    </div>
  );
}
