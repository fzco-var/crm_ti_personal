"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import type { Client } from "@/features/clients/types/client";
import { getOtherContacts } from "@/features/clients/utils";
import { TicketStatusBadge } from "@/features/tickets/components/ticket-status-badge";
import { getTicketsByRequester } from "@/features/tickets/utils";
import { getInitials } from "@/lib/text";

/**
 * `company` es la guardada: cambia al guardar la edición. Tras eliminar el
 * cliente, `deleted` deshabilita "Nuevo ticket para este contacto".
 */
export function ClientSidebar({
  client,
  company,
  deleted,
}: {
  client: Client;
  company: string;
  deleted: boolean;
}) {
  return (
    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
      <TicketsPanel clientId={client.id} deleted={deleted} />
      <OtherContactsPanel id={client.id} company={company} />
      <HistoryPanel history={client.history} />
    </aside>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3 p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-base font-bold wrap-anywhere">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyText({ children }: { children: string }) {
  return <p className="text-compact text-ink-muted">{children}</p>;
}

/** Los tickets que el cliente solicitó, en el orden de `data/tickets.ts`. */
function TicketsPanel({
  clientId,
  deleted,
}: {
  clientId: string;
  deleted: boolean;
}) {
  const tickets = getTicketsByRequester(clientId);
  const newTicketClassName =
    "crm-btn crm-btn-sm crm-btn-secondary gap-1.5 px-0 whitespace-nowrap";
  const newTicketContent = (
    <>
      <PlusIcon size={14} />
      Nuevo ticket para este contacto
    </>
  );

  return (
    <Panel
      title="Tickets"
      action={
        <Link
          href="/tickets"
          className="crm-hit flex-none text-compact font-bold"
        >
          Ver todos
        </Link>
      }
    >
      {tickets.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {tickets.map(({ id, code, title, status }) => (
            <li key={id}>
              <Link
                href={`/tickets/${id}`}
                className="flex flex-col gap-1 rounded-control bg-surface-muted px-3 py-2.5 text-ink hover:bg-surface-hover"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-ink-muted">
                    {code}
                  </span>
                  <TicketStatusBadge status={status} />
                </span>
                <span className="text-compact font-semibold">{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>Sin tickets.</EmptyText>
      )}
      {deleted ? (
        <button type="button" className={newTicketClassName} disabled>
          {newTicketContent}
        </button>
      ) : (
        <Link
          href={`/tickets/new?client=${clientId}`}
          className={newTicketClassName}
        >
          {newTicketContent}
        </Link>
      )}
    </Panel>
  );
}

function OtherContactsPanel({ id, company }: { id: string; company: string }) {
  const contacts = getOtherContacts({ id, company });

  return (
    <Panel title={`Otros contactos en ${company}`}>
      {contacts.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <Link
                href={`/clients/${contact.id}`}
                className="-mx-2 flex min-h-12 items-center gap-2.5 rounded-control px-2 py-1.5 text-ink hover:bg-surface-muted"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 flex-none items-center justify-center rounded-full bg-canvas font-mono text-2xs text-ink-soft"
                >
                  {getInitials(contact.firstName, contact.lastName)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-bold">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className="text-xs text-ink-muted">{contact.role}</span>
                </span>
                <ChevronRightIcon className="flex-none text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>Sin otros contactos.</EmptyText>
      )}
    </Panel>
  );
}

function HistoryPanel({ history }: Pick<Client, "history">) {
  return (
    <Panel title="Historial">
      {history.length > 0 ? (
        <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-compact leading-[1.45] text-ink-soft">
          {history.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      ) : (
        <EmptyText>Sin historial.</EmptyText>
      )}
    </Panel>
  );
}
