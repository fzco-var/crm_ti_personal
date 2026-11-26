import { clients } from "@/data/clients";
import { projects } from "@/data/projects";
import { PROJECT_STATUSES } from "@/features/projects/constants";
import type {
  MilestoneFormValues,
  Project,
  ProjectFormValues,
  ProjectHistoryEntry,
  ProjectStatus,
} from "@/features/projects/types/project";
import {
  addDays,
  formatDate,
  formatDays,
  getDaysUntil,
} from "@/features/tickets/utils";
import { normalizeText } from "@/lib/text";

/*
 * Las fechas son textos "2026-11-26", como en tickets: se comparan con < y >,
 * y los cálculos usan UTC para que el cambio de hora no altere los días.
 */

export type ProjectSortKey = "name" | "client" | "status" | "end";
export type SortDirection = 1 | -1;

function getStatusOrder(status: ProjectStatus) {
  return PROJECT_STATUSES.indexOf(status);
}

export function findProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

/** La empresa del proyecto es la de su contacto principal. */
export function getProjectCompany({ clientId }: Pick<Project, "clientId">) {
  return clients.find(({ id }) => id === clientId)?.company ?? "";
}

/** Clientes de la empresa del proyecto, con el contacto principal primero. */
export function getProjectContacts(project: Pick<Project, "clientId">) {
  const company = getProjectCompany(project);
  const contacts = clients.filter((client) => client.company === company);
  return [
    ...contacts.filter(({ id }) => id === project.clientId),
    ...contacts.filter(({ id }) => id !== project.clientId),
  ];
}

export function findProjectClient(clientId: string) {
  return clients.find((client) => client.id === clientId);
}

export function getClientName(clientId: string) {
  const client = findProjectClient(clientId);
  return client ? `${client.firstName} ${client.lastName}` : "";
}

export function getProjectsByClient(clientId: string) {
  return projects.filter((project) => project.clientId === clientId);
}

export function formatProjectCount(count: number) {
  return count === 1 ? "1 proyecto" : `${count} proyectos`;
}

// Atrasado y próximo dependen del desfase guardado, no de "hoy".

export function isOverdue({ status, endInDays }: Project) {
  return status !== "Completado" && endInDays < 0;
}

export function isDueSoon({ status, endInDays }: Project) {
  return status !== "Completado" && endInDays >= 0 && endInDays <= 7;
}

/** "Terminado", "Vence hoy", "Atrasado 3 días" o "En 4 días". */
export function getEndText({ status, endInDays }: Project) {
  if (status === "Completado") return "Terminado";
  if (endInDays === 0) return "Vence hoy";
  if (endInDays < 0) return `Atrasado ${formatDays(-endInDays)}`;
  return `En ${formatDays(endInDays)}`;
}

/** Nombre, código, contacto y empresa, sin mayúsculas ni tildes. */
export function matchesProjectSearch(project: Project, query: string) {
  const text = normalizeText(query);
  if (!text) return true;
  return normalizeText(
    [
      project.name,
      project.code,
      getClientName(project.clientId),
      getProjectCompany(project),
    ].join(" "),
  ).includes(text);
}

export function sortProjects(
  list: Project[],
  key: ProjectSortKey,
  direction: SortDirection,
) {
  const compare: Record<ProjectSortKey, (a: Project, b: Project) => number> = {
    name: (a, b) => a.name.localeCompare(b.name, "es"),
    client: (a, b) =>
      getClientName(a.clientId).localeCompare(getClientName(b.clientId), "es"),
    status: (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status),
    end: (a, b) => a.endInDays - b.endInDays,
  };
  return [...list].sort((a, b) => compare[key](a, b) * direction);
}

// Fechas

/** Desfase en días respecto a hoy, como fecha. */
export function toProjectDate(today: string, offsetInDays: number) {
  return addDays(today, offsetInDays);
}

/** Como `Date#setMonth`: el 31 de enero + 1 mes es el 3 de marzo. */
export function addMonths(date: string, months: number) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result.toISOString().slice(0, 10);
}

/** Días entre inicio y término, o nula si falta alguna fecha. */
export function getDurationDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  return getDaysUntil(endDate, startDate);
}

/** "10 días", "6 semanas (42 días)" o "3 meses (90 días)". */
export function formatDurationText(days: number) {
  if (days < 14) return formatDays(days);
  const rounded =
    days < 70
      ? `${Math.round(days / 7)} semanas`
      : `${Math.round(days / 30)} meses`;
  return `${rounded} (${days} días)`;
}

export function isWeekend(date: string) {
  const day = new Date(date).getUTCDay();
  return day === 0 || day === 6;
}

/** Término de la vista previa: "Vence hoy", "Hace 5 días" o "En 30 días". */
export function getPreviewEndText(endDate: string, today: string) {
  const days = getDaysUntil(endDate, today);
  if (days === 0) return "Vence hoy";
  if (days < 0) return `Hace ${formatDays(-days)}`;
  return `En ${formatDays(days)}`;
}

/** "+7 días" o "-1 día". */
export function formatDayDelta(days: number) {
  return `${days > 0 ? "+" : ""}${days} ${Math.abs(days) === 1 ? "día" : "días"}`;
}

/** Posición en la línea de tiempo, entre 0 y 100. */
export function getTimelinePercent(
  date: string,
  startDate: string,
  endDate: string,
) {
  const total = getDurationDays(startDate, endDate);
  if (!total || total <= 0) return 0;
  const percent = (getDaysUntil(date, startDate) / total) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

/** "Hito «MVP» completado · 16 nov 2026" o "… · ahora". */
export function formatHistoryEntry(
  { text, daysAgo }: ProjectHistoryEntry,
  today: string,
) {
  const when = daysAgo === 0 ? "ahora" : formatDate(addDays(today, -daysAgo));
  return `${text} · ${when}`;
}

/** "Vencido hace 2 días", o nulo si está hecho o no ha vencido. */
export function getMilestoneOverdueText(
  { date, done }: MilestoneFormValues,
  today: string,
) {
  if (done || !date || date >= today) return null;
  return `Vencido hace ${formatDays(getDaysUntil(today, date))}`;
}

// Validación

export type ProjectField = "name" | "clientId" | "startDate" | "endDate";

export function isEndBeforeStart(startDate: string, endDate: string) {
  return Boolean(startDate && endDate && endDate < startDate);
}

export function isMilestoneOutOfRange(
  date: string,
  startDate: string,
  endDate: string,
) {
  if (!date) return false;
  return Boolean(
    (startDate && date < startDate) || (endDate && date > endDate),
  );
}

export function hasMilestonesOutOfRange({
  milestones,
  startDate,
  endDate,
}: ProjectFormValues) {
  return milestones.some(({ date }) =>
    isMilestoneOutOfRange(date, startDate, endDate),
  );
}

/**
 * Campos obligatorios vacíos y término anterior al inicio. La edición no pide
 * cliente porque siempre tiene uno.
 */
export function getInvalidProjectFields(values: ProjectFormValues) {
  const isValid: Record<ProjectField, boolean> = {
    name: Boolean(values.name.trim()),
    clientId: Boolean(values.clientId),
    startDate: Boolean(values.startDate),
    endDate:
      Boolean(values.endDate) &&
      !isEndBeforeStart(values.startDate, values.endDate),
  };
  return (Object.keys(isValid) as ProjectField[]).filter(
    (field) => !isValid[field],
  );
}

export function isValidProject(values: ProjectFormValues) {
  return (
    getInvalidProjectFields(values).length === 0 &&
    !hasMilestonesOutOfRange(values)
  );
}

// Formularios

/** Valores de edición de un proyecto guardado; `today` fija los desfases. */
export function toProjectFormValues(
  project: Project,
  today: string,
): ProjectFormValues {
  return {
    name: project.name,
    clientId: project.clientId,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: toProjectDate(today, project.startInDays),
    endDate: toProjectDate(today, project.endInDays),
    milestones: project.milestones.map((milestone, index) => ({
      key: `m${index + 1}`,
      name: milestone.name,
      date: toProjectDate(today, milestone.dueInDays),
      done: milestone.done,
    })),
  };
}

/** Compara los hitos sin tener en cuenta su `key`. */
export function areMilestonesEqual(
  a: MilestoneFormValues[],
  b: MilestoneFormValues[],
) {
  return (
    a.length === b.length &&
    a.every(
      (milestone, index) =>
        milestone.name === b[index].name &&
        milestone.date === b[index].date &&
        milestone.done === b[index].done,
    )
  );
}
