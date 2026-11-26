"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  MoreIcon,
  PencilIcon,
  WarningIcon,
} from "@/components/icons";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import type { Project } from "@/features/projects/types/project";
import {
  type ProjectSortKey,
  type ProjectsSort,
  getClientName,
  getEndText,
  getProjectCompany,
  isDueSoon,
  isOverdue,
  sortProjects,
  toProjectDate,
} from "@/features/projects/utils";
import { formatDate } from "@/features/tickets/utils";

export const PROJECT_COLUMNS: {
  label: string;
  sortKey: ProjectSortKey;
  className: string;
}[] = [
  { label: "Nombre del proyecto", sortKey: "name", className: "" },
  { label: "Cliente", sortKey: "client", className: "w-[24%]" },
  { label: "Estado", sortKey: "status", className: "w-[15%]" },
  { label: "Fecha de término", sortKey: "end", className: "w-[17%]" },
];

/** `today` es nula durante el prerender: la fecha se muestra al conocerla. */
export function ProjectsTable({
  projects,
  sort,
  today,
  onSortChange,
}: {
  projects: Project[];
  sort: ProjectsSort;
  today: string | null;
  onSortChange: (sort: ProjectsSort) => void;
}) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table min-w-[820px]">
        <thead>
          <tr>
            {PROJECT_COLUMNS.map((column) => (
              <SortableHeader
                key={column.sortKey}
                {...column}
                sort={sort}
                onSortChange={onSortChange}
              />
            ))}
            {/* `relative` evita que el texto oculto desborde la página. */}
            <th scope="col" className="relative w-[88px]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortProjects(projects, sort).map((project) => (
            <ProjectRow key={project.id} project={project} today={today} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  className,
  sort,
  onSortChange,
}: {
  label: string;
  sortKey: ProjectSortKey;
  className: string;
  sort: ProjectsSort;
  onSortChange: (sort: ProjectsSort) => void;
}) {
  const active = sort.key === sortKey;
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

function ProjectRow({
  project,
  today,
}: {
  project: Project;
  today: string | null;
}) {
  const overdue = isOverdue(project);
  const dueSoon = isDueSoon(project);
  const endTone = overdue
    ? "font-bold text-danger"
    : dueSoon
      ? "font-bold text-warning"
      : "font-medium text-ink-muted";

  return (
    <tr>
      <th scope="row" className="pl-5">
        <span className="flex flex-col gap-0.5">
          <Link
            href={`/projects/${project.id}`}
            className="font-bold text-ink underline-offset-[3px] hover:underline"
          >
            {project.name}
          </Link>
          <span className="font-mono text-xs font-normal text-ink-muted">
            {project.code}
          </span>
        </span>
      </th>
      <td>
        <span className="flex flex-col gap-0.5">
          <Link
            href={`/clients/${project.clientId}`}
            className="self-start font-semibold text-ink underline-offset-[3px] hover:underline"
          >
            {getClientName(project.clientId)}
          </Link>
          <span className="text-xs text-ink-muted">
            {getProjectCompany(project)}
          </span>
        </span>
      </td>
      <td className="whitespace-nowrap">
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className="whitespace-nowrap">
        <span className="flex flex-col gap-0.5">
          <span className="min-h-5 font-mono text-[13px] text-ink">
            {today && formatDate(toProjectDate(today, project.endInDays))}
          </span>
          <span className={`flex items-center gap-1.5 text-xs ${endTone}`}>
            {(overdue || dueSoon) && (
              <WarningIcon size={12} strokeWidth={2.4} />
            )}
            {getEndText(project)}
          </span>
        </span>
      </td>
      <td className="py-2 pr-5 pl-2">
        <span className="flex justify-end gap-1">
          <Link
            href={`/projects/${project.id}`}
            className="crm-icon-btn"
            aria-label={`Editar proyecto ${project.name}`}
          >
            <PencilIcon />
          </Link>
          <button
            type="button"
            className="crm-icon-btn"
            aria-label={`Más acciones para ${project.name}`}
            disabled
          >
            <MoreIcon />
          </button>
        </span>
      </td>
    </tr>
  );
}
