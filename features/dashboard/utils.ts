import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { tickets } from "@/data/tickets";
import { isOverdue } from "@/features/projects/utils";
import type { Project } from "@/features/projects/types/project";
import type { Service } from "@/features/services/types/service";
import { getServicesSummary } from "@/features/services/utils";
import type { Ticket } from "@/features/tickets/types/ticket";

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
