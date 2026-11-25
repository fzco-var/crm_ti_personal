"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  ClientsIcon,
  DownloadIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import {
  ClientsTable,
  type ClientsSort,
} from "@/features/clients/components/clients-table";
import { CLIENT_ROLES } from "@/features/clients/constants";
import type { Client, ClientRole } from "@/features/clients/types/client";
import { formatPhone } from "@/features/clients/utils";
import { normalizeText } from "@/lib/text";

type RoleFilter = ClientRole | "Todos";

const ROLE_FILTERS: RoleFilter[] = [
  "Todos",
  ...CLIENT_ROLES.map(({ value }) => value),
];

function filterByRole(clients: Client[], filter: RoleFilter) {
  return filter === "Todos"
    ? clients
    : clients.filter(({ role }) => role === filter);
}

function matchesSearch(client: Client, search: string) {
  const query = normalizeText(search);
  const phone = formatPhone(client.phonePrefix, client.phone);
  const text = [
    client.firstName,
    client.lastName,
    client.company,
    phone,
    client.email,
    client.street,
    client.unit,
    client.city,
    client.region,
  ].join(" ");

  return (
    normalizeText(text).includes(query) ||
    phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""))
  );
}

export function ClientsList({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("Todos");
  const [sort, setSort] = useState<ClientsSort>({
    key: "lastName",
    direction: "ascending",
  });
  const [notice, setNotice] = useState("");

  // Al salir, Activity conserva el estado; el aviso es lo único que se cierra.
  useLayoutEffect(() => () => setNotice(""), []);

  const visibleClients = filterByRole(clients, roleFilter).filter((client) =>
    matchesSearch(client, search),
  );
  const companyCount = new Set(clients.map(({ company }) => company)).size;
  const isEmpty = clients.length === 0;

  return (
    <div className="crm-content max-w-[1240px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[{ label: "Operación" }, { label: "Clientes" }]} />
          <h1 className="crm-title">Clientes</h1>
          <p className="text-sm text-ink-muted">
            {isEmpty
              ? "Todavía no hay contactos."
              : `${clients.length} contactos · ${companyCount} empresas`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={() =>
              setNotice(
                `Se exportaron ${visibleClients.length} contactos a clientes.csv.`,
              )
            }
          >
            <DownloadIcon />
            Exportar CSV
          </button>
          <Link href="/clients/new" className="crm-btn crm-btn-primary">
            <PlusIcon />
            Nuevo cliente
          </Link>
        </div>
      </div>

      {notice && (
        <Alert variant="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      <section
        aria-label="Listado de clientes"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="relative flex max-w-[420px] flex-[1_1_300px]">
            <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
            <label htmlFor="clients-search" className="sr-only">
              Buscar clientes
            </label>
            <input
              id="clients-search"
              type="search"
              className="crm-field crm-field-sm pl-[42px]"
              placeholder="Buscar por nombre, empresa, teléfono, correo o dirección"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div
            role="group"
            aria-label="Filtrar por rol"
            className="flex flex-wrap gap-2"
          >
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className="crm-chip"
                aria-pressed={filter === roleFilter}
                onClick={() => setRoleFilter(filter)}
              >
                {filter}
                <span className="font-mono text-xs opacity-75">
                  {filterByRole(clients, filter).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {visibleClients.length > 0 ? (
          <ClientsTable
            clients={visibleClients}
            sort={sort}
            onSortChange={setSort}
          />
        ) : (
          <EmptyState isEmpty={isEmpty} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          <span>
            Mostrando {visibleClients.length} de {clients.length} contactos
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              className="crm-btn crm-btn-sm crm-btn-secondary"
              disabled
            >
              Anterior
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-sm crm-btn-secondary"
              disabled
            >
              Siguiente
            </button>
          </span>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        <ClientsIcon size={22} />
      </span>
      <span className="text-base font-bold">
        {isEmpty ? "Aún no tienes clientes" : "Sin resultados"}
      </span>
      <span className="max-w-[380px] text-sm leading-normal text-ink-muted">
        {isEmpty
          ? "Agrega el primero con “Nuevo cliente”."
          : "Ningún cliente coincide con la búsqueda o el filtro."}
      </span>
    </div>
  );
}
