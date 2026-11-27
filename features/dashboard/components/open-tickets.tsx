"use client";

import Link from "next/link";
import { useId } from "react";
import { TONE_DOT_CLASSES } from "@/components/tone";
import type {
  getRecentTickets,
  getTicketStatusCounts,
} from "@/features/dashboard/utils";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import { TICKET_STATUS_TONES } from "@/features/tickets/constants";
import type { TicketStatus } from "@/features/tickets/types/ticket";

type StatusCount = ReturnType<typeof getTicketStatusCounts>[number];
type RecentTicket = ReturnType<typeof getRecentTickets>[number];

/** "4 abiertos", "1 abierto", "3 en curso" o "2 en espera". */
function formatStatusCount({ status, count }: StatusCount) {
  const label: Record<TicketStatus, string> = {
    Abierto: count === 1 ? "abierto" : "abiertos",
    "En curso": "en curso",
    "En espera": "en espera",
    Cerrado: count === 1 ? "cerrado" : "cerrados",
  };
  return `${count} ${label[status]}`;
}

export function OpenTickets({
  statusCounts,
  recentTickets,
}: {
  statusCounts: StatusCount[];
  recentTickets: RecentTicket[];
}) {
  const headingId = useId();
  const total = statusCounts.reduce((sum, { count }) => sum + count, 0);

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3.5 px-6 py-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={headingId} className="crm-heading">
          Tickets sin cerrar
        </h2>
        <Link
          href="/tickets"
          className="crm-link crm-hit text-compact font-bold"
        >
          Ver todos
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-sm text-ink-muted">No hay tickets sin cerrar.</p>
      ) : (
        <>
          <div
            role="img"
            aria-label={`Tickets por estado: ${statusCounts.map(formatStatusCount).join(", ")}`}
            className="flex h-3 gap-0.5 overflow-hidden rounded"
          >
            {statusCounts
              .filter(({ count }) => count > 0)
              .map(({ status, count }) => (
                <span
                  key={status}
                  title={`${status}: ${count}`}
                  className={TONE_DOT_CLASSES[TICKET_STATUS_TONES[status]]}
                  style={{ flex: `${count} 1 0` }}
                />
              ))}
          </div>

          <ul
            aria-label="Leyenda"
            className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-compact"
          >
            {statusCounts.map(({ status, count }) => (
              <li key={status} className="flex items-center gap-1.5">
                <span
                  className={`size-2.5 rounded-[3px] ${TONE_DOT_CLASSES[TICKET_STATUS_TONES[status]]}`}
                />
                <span className="text-ink-soft">{status}</span>
                <strong className="font-mono">{count}</strong>
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-0.5">
            {recentTickets.map(({ ticket, projectCode, openedText }) => (
              <li key={ticket.id}>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="-mx-2.5 flex items-center gap-3 rounded-[10px] px-2.5 py-2 hover:bg-surface-hover"
                >
                  <span className="w-16 flex-none font-mono text-xs text-ink-muted">
                    {ticket.code}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-px">
                    <span className="truncate text-compact font-bold">
                      {ticket.title}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {[projectCode, openedText].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="flex-none">
                    <TicketStatusBadge status={ticket.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
