import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { tickets } from "@/data/tickets";
import {
  ATTENTION_KIND_ORDER,
  ATTENTION_LIMIT,
  ATTENTION_SOON_DAYS,
  RECENT_TICKETS_LIMIT,
} from "@/features/dashboard/constants";
import type {
  AttentionItem,
  RenewalRange,
} from "@/features/dashboard/types/dashboard";
import {
  findProjectById,
  getProjectCompany,
  isOverdue,
} from "@/features/projects/utils";
import type { Project } from "@/features/projects/types/project";
import type { Service } from "@/features/services/types/service";
import {
  formatCLP,
  getMonthlyContribution,
  getServiceCompany,
  getServicesSummary,
} from "@/features/services/utils";
import { TICKET_STATUSES } from "@/features/tickets/constants";
import type { Ticket } from "@/features/tickets/types/ticket";
import {
  formatDays,
  formatHoursAgo,
  getTicketsByProject,
} from "@/features/tickets/utils";

/*
 * El dashboard solo lee: todo sale de `data/` con las utilidades de proyectos,
 * servicios y tickets.
 */

// Definiciones

export function isOpenTicket({ status }: Pick<Ticket, "status">) {
  return status !== "Cerrado";
}

export function isHighPriority({ priority }: Pick<Ticket, "priority">) {
  return priority === "Alta" || priority === "Urgente";
}

/** "hace 1 día": la actividad más antigua es la apertura. */
export function getTicketOpenedText({ activity }: Pick<Ticket, "activity">) {
  return formatHoursAgo(activity.at(-1)?.hoursAgo ?? 0);
}

export function isActiveProject({ status }: Pick<Project, "status">) {
  return status !== "Completado";
}

/** Cargos sin pagar de servicios no cancelados, en el orden de `data/services`. */
export function getPendingCharges(list: Service[] = services) {
  return list
    .filter(({ status }) => status !== "Cancelado")
    .flatMap((service) =>
      service.charges
        .filter(({ paidDay }) => paidDay === null)
        .map((charge) => ({ service, charge })),
    );
}

// Cabecera

/** "Buenos días" antes de las 12, "Buenas tardes" antes de las 20 y "Buenas noches" desde las 20. */
export function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

/** "viernes, 27 de noviembre de 2026" */
export function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "hace 3 d", "hoy", "mañana" o "en 4 d". */
export function formatRelativeDays(days: number) {
  if (days < 0) return `hace ${-days} d`;
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  return `en ${days} d`;
}

// Indicadores

export function getDashboardKpis() {
  const { revenue, margin, marginPercent } = getServicesSummary(services);
  const pending = getPendingCharges();
  const openTickets = tickets.filter(isOpenTicket);
  const activeProjects = projects.filter(isActiveProject);

  return {
    revenue,
    margin,
    marginPercent,
    pendingAmount: pending.reduce((sum, { charge }) => sum + charge.amount, 0),
    pendingCount: pending.length,
    openTicketCount: openTickets.length,
    // Los de estado "Abierto", entre los sin cerrar.
    newTicketCount: openTickets.filter(({ status }) => status === "Abierto")
      .length,
    highPriorityCount: openTickets.filter(isHighPriority).length,
    activeProjectCount: activeProjects.length,
    overdueProjectCount: activeProjects.filter(isOverdue).length,
  };
}

// Necesita tu atención

/** "sin tickets abiertos", "1 ticket abierto" o "3 tickets abiertos". */
function formatOpenTickets(count: number) {
  if (count === 0) return "sin tickets abiertos";
  return count === 1 ? "1 ticket abierto" : `${count} tickets abiertos`;
}

/** "1 hito pendiente" o "3 hitos pendientes". */
function formatPendingMilestones(count: number) {
  return count === 1 ? "1 hito pendiente" : `${count} hitos pendientes`;
}

/** "este mes", "hace 1 mes" o "hace 3 meses". */
function formatChargeMonth(monthsAgo: number) {
  if (monthsAgo === 0) return "este mes";
  return monthsAgo === 1 ? "hace 1 mes" : `hace ${monthsAgo} meses`;
}

function getOverdueProjectItems(): AttentionItem[] {
  return projects.filter(isOverdue).map((project) => ({
    id: `project-${project.id}`,
    kind: "critical",
    title: `${project.code} · ${project.name}`,
    detail: [
      "Proyecto atrasado",
      getProjectCompany(project),
      formatOpenTickets(
        getTicketsByProject(project.id).filter(isOpenTicket).length,
      ),
    ].join(" · "),
    href: `/projects/${project.id}`,
    whenText: formatRelativeDays(project.endInDays),
    sortDays: project.endInDays,
  }));
}

function getHighPriorityTicketItems(): AttentionItem[] {
  return tickets
    .filter((ticket) => isOpenTicket(ticket) && isHighPriority(ticket))
    .map((ticket) => ({
      id: `ticket-${ticket.id}`,
      kind: "critical",
      title: `${ticket.code} · ${ticket.title}`,
      detail: [
        ticket.priority === "Urgente" ? "Prioridad urgente" : "Prioridad alta",
        findProjectById(ticket.projectId)?.code,
        `abierto ${getTicketOpenedText(ticket)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/tickets/${ticket.id}`,
      whenText:
        ticket.dueInDays === null
          ? "sin fecha"
          : formatRelativeDays(ticket.dueInDays),
      sortDays: ticket.dueInDays,
    }));
}

function getPendingChargeItems(): AttentionItem[] {
  return getPendingCharges().map(({ service, charge }) => ({
    id: `charge-${service.id}-${charge.monthsAgo}`,
    kind: "money",
    title: `Cobro pendiente de ${formatCLP(charge.amount)}`,
    detail: `${service.name} · ${getServiceCompany(service)}`,
    href: `/services/${service.id}`,
    whenText: formatChargeMonth(charge.monthsAgo),
    // Un cargo solo conoce su mes.
    sortDays: 0 - 30 * charge.monthsAgo, // `0 -` evita el −0 del mes en curso.
  }));
}

function getManualRenewalItems(): AttentionItem[] {
  return services
    .filter(
      ({ status, autoRenew, renewInDays }) =>
        status === "Activo" && !autoRenew && renewInDays <= ATTENTION_SOON_DAYS,
    )
    .map((service) => ({
      id: `renewal-${service.id}`,
      kind: "clock",
      title: "Renovar servicio (manual)",
      detail: `${formatCLP(service.charge)} / ${service.period} · ${getServiceCompany(service)}`,
      href: `/services/${service.id}`,
      whenText: formatRelativeDays(service.renewInDays),
      sortDays: service.renewInDays,
    }));
}

function getEndingProjectItems(): AttentionItem[] {
  return projects
    .filter(
      ({ status, endInDays }) =>
        status === "En curso" &&
        endInDays >= 0 &&
        endInDays <= ATTENTION_SOON_DAYS,
    )
    .map((project) => ({
      id: `project-${project.id}`,
      kind: "clock",
      title: `${project.code} · ${project.name}`,
      detail: [
        "Termina pronto",
        getProjectCompany(project),
        formatPendingMilestones(
          project.milestones.filter(({ done }) => !done).length,
        ),
      ].join(" · "),
      href: `/projects/${project.id}`,
      whenText: formatRelativeDays(project.endInDays),
      sortDays: project.endInDays,
    }));
}

/** `sortDays` ascendente con los `null` al final, luego el tipo; el orden de los datos lo da `sort`, que es estable. */
function compareAttentionItems(a: AttentionItem, b: AttentionItem) {
  if (a.sortDays !== b.sortDays) {
    if (a.sortDays === null) return 1;
    if (b.sortDays === null) return -1;
    return a.sortDays - b.sortDays;
  }
  return (
    ATTENTION_KIND_ORDER.indexOf(a.kind) - ATTENTION_KIND_ORDER.indexOf(b.kind)
  );
}

/** Los 6 avisos más urgentes y cuántos quedan fuera. */
export function getAttentionItems() {
  const all = [
    ...getOverdueProjectItems(),
    ...getHighPriorityTicketItems(),
    ...getPendingChargeItems(),
    ...getManualRenewalItems(),
    ...getEndingProjectItems(),
  ].sort(compareAttentionItems);

  return {
    items: all.slice(0, ATTENTION_LIMIT),
    moreCount: Math.max(0, all.length - ATTENTION_LIMIT),
  };
}

// Proyectos activos

/** "En pausa", "Atrasado 3 días", "Planificado · termina en 12 d", "Termina hoy" o "Termina en 4 d". */
function getProjectDeadline(project: Project): {
  text: string;
  tone: "danger" | "warning" | null;
} {
  const { status, endInDays } = project;
  if (status === "En pausa") return { text: "En pausa", tone: null };
  if (isOverdue(project)) {
    return { text: `Atrasado ${formatDays(-endInDays)}`, tone: "danger" };
  }
  if (status === "Planificado") {
    return { text: `Planificado · termina en ${endInDays} d`, tone: null };
  }
  return {
    text: endInDays === 0 ? "Termina hoy" : `Termina en ${endInDays} d`,
    tone: endInDays <= ATTENTION_SOON_DAYS ? "warning" : null,
  };
}

/** Proyectos no completados por término ascendente, con plazo y avance. */
export function getActiveProjects() {
  return projects
    .filter(isActiveProject)
    .sort((a, b) => a.endInDays - b.endInDays)
    .map((project) => {
      const total = project.milestones.length;
      const done = project.milestones.filter(
        (milestone) => milestone.done,
      ).length;
      return {
        project,
        company: getProjectCompany(project),
        deadline: getProjectDeadline(project),
        // El atraso pesa más que la pausa.
        barTone: isOverdue(project)
          ? ("danger" as const)
          : project.status === "En pausa"
            ? ("paused" as const)
            : ("default" as const),
        doneMilestones: done,
        totalMilestones: total,
        progressPercent: total ? Math.round((done / total) * 100) : 0,
      };
    });
}

// Ingreso recurrente por cliente

/** Empresas con ingreso mensual mayor que 0, de mayor a menor. */
export function getRevenueByCompany() {
  const byCompany = new Map<string, { amount: number; serviceCount: number }>();
  for (const service of services) {
    const amount = getMonthlyContribution(service);
    if (amount <= 0) continue;
    const company = getServiceCompany(service);
    const row = byCompany.get(company) ?? { amount: 0, serviceCount: 0 };
    byCompany.set(company, {
      amount: row.amount + amount,
      serviceCount: row.serviceCount + 1,
    });
  }

  const total = [...byCompany.values()].reduce(
    (sum, { amount }) => sum + amount,
    0,
  );
  const rows = [...byCompany]
    .map(([company, row]) => ({
      company,
      ...row,
      share: total ? row.amount / total : 0,
      percent: total ? Math.round((row.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { rows, total };
}

// Tickets sin cerrar

/** Cantidad por estado: Abierto, En curso y En espera. */
export function getTicketStatusCounts() {
  return TICKET_STATUSES.filter((status) => status !== "Cerrado").map(
    (status) => ({
      status,
      count: tickets.filter((ticket) => ticket.status === status).length,
    }),
  );
}

/** Los 5 tickets sin cerrar con la actividad más reciente. */
export function getRecentTickets() {
  return tickets
    .filter(isOpenTicket)
    .sort(
      (a, b) =>
        (a.activity[0]?.hoursAgo ?? Infinity) -
        (b.activity[0]?.hoursAgo ?? Infinity),
    )
    .slice(0, RECENT_TICKETS_LIMIT)
    .map((ticket) => ({
      ticket,
      projectCode: findProjectById(ticket.projectId)?.code ?? "",
      openedText: getTicketOpenedText(ticket),
    }));
}

// Próximas renovaciones

/** Servicios activos que renuevan dentro del rango, vencidos incluidos, por fecha ascendente. */
export function getRenewals(range: RenewalRange) {
  const list = services
    .filter(
      ({ status, renewInDays }) => status === "Activo" && renewInDays <= range,
    )
    .sort((a, b) => a.renewInDays - b.renewInDays)
    .map((service) => ({ service, company: getServiceCompany(service) }));

  return {
    list,
    manualCount: list.filter(({ service }) => !service.autoRenew).length,
  };
}
