"use client";

import Link from "next/link";
import { ChevronDownIcon, MoreIcon, PencilIcon } from "@/components/icons";
import { RoleBadge } from "@/features/clients/components/role-badge";
import type { Client } from "@/features/clients/types/client";
import { formatPhone, getCompanyInitials } from "@/features/clients/utils";

export type SortKey = "firstName" | "lastName" | "company" | "role";

export interface ClientsSort {
  key: SortKey;
  direction: "ascending" | "descending";
}

const COLUMNS: { label: string; sortKey?: SortKey }[] = [
  { label: "Nombre", sortKey: "firstName" },
  { label: "Apellido", sortKey: "lastName" },
  { label: "Empresa", sortKey: "company" },
  { label: "Teléfono" },
  { label: "Correo" },
  { label: "Dirección" },
  { label: "Rol", sortKey: "role" },
];

function sortClients(clients: Client[], { key, direction }: ClientsSort) {
  const sign = direction === "ascending" ? 1 : -1;
  return [...clients].sort((a, b) => a[key].localeCompare(b[key], "es") * sign);
}

/** El orden lo guarda el listado: la tabla se desmonta si no hay filas. */
export function ClientsTable({
  clients,
  sort,
  onSortChange,
}: {
  clients: Client[];
  sort: ClientsSort;
  onSortChange: (sort: ClientsSort) => void;
}) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table min-w-[1180px]">
        <thead>
          <tr>
            {COLUMNS.map(({ label, sortKey }) =>
              sortKey ? (
                <SortableHeader
                  key={label}
                  label={label}
                  sortKey={sortKey}
                  sort={sort}
                  onSortChange={onSortChange}
                />
              ) : (
                <th key={label} scope="col" className="whitespace-nowrap">
                  {label}
                </th>
              ),
            )}
            {/* `relative` evita que el texto oculto desborde la página. */}
            <th scope="col" className="relative w-[88px]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortClients(clients, sort).map((client) => (
            <ClientRow key={client.id} client={client} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSortChange,
}: {
  label: string;
  sortKey: SortKey;
  sort: ClientsSort;
  onSortChange: (sort: ClientsSort) => void;
}) {
  const active = sort.key === sortKey;
  const descending = active && sort.direction === "descending";

  return (
    <th
      scope="col"
      aria-sort={active ? sort.direction : "none"}
      className="whitespace-nowrap"
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

function ClientRow({ client }: { client: Client }) {
  const fullName = `${client.firstName} ${client.lastName}`;

  return (
    <tr>
      <th scope="row" className="font-bold whitespace-nowrap">
        {client.firstName}
      </th>
      <td className="font-bold whitespace-nowrap">{client.lastName}</td>
      <td className="whitespace-nowrap">
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-7 flex-none items-center justify-center rounded-[7px] border border-line bg-canvas font-mono text-2xs font-medium text-ink-soft"
          >
            {getCompanyInitials(client.company)}
          </span>
          {client.company}
        </span>
      </td>
      <td className="whitespace-nowrap">
        <a
          href={`tel:${client.phonePrefix}${client.phone}`}
          className="crm-hit crm-code text-ink underline-offset-[3px] hover:underline"
        >
          {formatPhone(client.phonePrefix, client.phone)}
        </a>
      </td>
      <td className="whitespace-nowrap">
        <a
          href={`mailto:${client.email}`}
          className="crm-hit underline-offset-[3px] hover:underline"
        >
          {client.email}
        </a>
      </td>
      <td className="min-w-[200px] py-3">
        <span className="flex flex-col gap-0.5 leading-[1.35]">
          <span>{[client.street, client.unit].filter(Boolean).join(", ")}</span>
          <span className="text-xs text-ink-muted">
            {client.city}, {client.region}
          </span>
        </span>
      </td>
      <td className="whitespace-nowrap">
        <RoleBadge role={client.role} />
      </td>
      <td className="py-2 pr-5 pl-2">
        <span className="flex justify-end gap-1">
          <Link
            href={`/clients/${client.id}`}
            className="crm-icon-btn"
            aria-label={`Editar a ${fullName}`}
          >
            <PencilIcon />
          </Link>
          <button
            type="button"
            className="crm-icon-btn"
            aria-label={`Más acciones para ${fullName}`}
            disabled
          >
            <MoreIcon />
          </button>
        </span>
      </td>
    </tr>
  );
}
