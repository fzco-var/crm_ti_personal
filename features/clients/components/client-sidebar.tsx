"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import { TONE_CLASSES } from "@/features/clients/components/role-badge";
import { TICKET_STATUS_TONES } from "@/features/clients/constants";
import type { Client } from "@/features/clients/types/client";
import { getOtherContacts } from "@/features/clients/utils";
import { getInitials } from "@/lib/text";

/** `company` es la guardada: cambia al guardar la edición. */
export function ClientSidebar({
  client,
  company,
}: {
  client: Client;
  company: string;
}) {
  return (
    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
      <TicketsPanel tickets={client.tickets} />
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

function TicketsPanel({ tickets }: Pick<Client, "tickets">) {
  return (
    <Panel
      title="Tickets"
      action={
        <a
          role="link"
          aria-disabled="true"
          className="flex-none cursor-not-allowed text-compact font-bold opacity-45"
        >
          Ver todos
        </a>
      }
    >
      {tickets.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {tickets.map(({ id, title, status }) => (
            <li
              key={id}
              className="flex flex-col gap-1 rounded-control bg-surface-muted px-3 py-2.5"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink-muted">{id}</span>
                <span
                  className={`crm-badge ${TONE_CLASSES[TICKET_STATUS_TONES[status]]}`}
                >
                  {status}
                </span>
              </span>
              <span className="text-compact font-semibold">{title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyText>Sin tickets.</EmptyText>
      )}
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-secondary gap-1.5 px-0 whitespace-nowrap"
        disabled
      >
        <PlusIcon size={14} />
        Nuevo ticket para este contacto
      </button>
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
