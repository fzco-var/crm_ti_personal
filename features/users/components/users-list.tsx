"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { UsersTable } from "@/features/users/components/users-table";
import type { Role } from "@/features/users/types/role";
import type { User } from "@/features/users/types/user";
import {
  countUsersByRole,
  getUsersSummaryText,
  matchesUserSearch,
} from "@/features/users/utils";

/** Activity conserva búsqueda y filtro de rol al volver al listado. */
export function UsersList({ users, roles }: { users: User[]; roles: Role[] }) {
  const today = useToday();
  const searchId = useId();
  const [search, setSearch] = useState("");
  // "" es "Todos".
  const [roleFilter, setRoleFilter] = useState("");
  const [notice, setNotice] = useState("");

  // Al salir, Activity conserva el estado; el aviso es lo único que se cierra.
  useLayoutEffect(() => () => setNotice(""), []);

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando usuarios…
        </p>
      </div>
    );
  }

  const visibleUsers = users.filter(
    (user) =>
      (!roleFilter || user.roleId === roleFilter) &&
      matchesUserSearch(user, search),
  );
  const filters = [
    { id: "", label: "Todos", count: users.length },
    ...roles.map((role) => ({
      id: role.id,
      label: role.name,
      count: countUsersByRole(users, role.id),
    })),
  ];

  return (
    <div className="crm-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[{ label: "Configuración" }, { label: "Usuarios" }]}
          />
          <h1 className="crm-title">Usuarios</h1>
          <p className="text-sm text-ink-muted">{getUsersSummaryText(users)}</p>
        </div>
        <Link href="/users/new" className="crm-btn crm-btn-primary">
          <PlusIcon />
          Nuevo usuario
        </Link>
      </div>

      {notice && (
        <Alert variant="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      <section
        aria-label="Listado de usuarios"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="relative flex max-w-[380px] flex-[1_1_280px]">
            <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
            <label htmlFor={searchId} className="sr-only">
              Buscar usuarios
            </label>
            <input
              id={searchId}
              type="search"
              className="crm-field crm-field-sm pl-[42px]"
              placeholder="Buscar por nombre, usuario o email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div
            role="group"
            aria-label="Filtrar por rol"
            className="flex flex-wrap gap-1.5"
          >
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className="crm-chip"
                aria-pressed={filter.id === roleFilter}
                onClick={() => setRoleFilter(filter.id)}
              >
                {filter.label}
                <span className="font-mono text-xs opacity-75">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {visibleUsers.length > 0 ? (
          <UsersTable
            users={visibleUsers}
            onResetPassword={(user) =>
              setNotice(
                `Enviamos un enlace para restablecer la contraseña a ${user.email}.`,
              )
            }
          />
        ) : (
          <EmptyState isEmpty={users.length === 0} />
        )}

        <div className="border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          Mostrando {visibleUsers.length} de {users.length} usuarios
        </div>
      </section>
    </div>
  );
}

function EmptyState({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        <SearchIcon size={22} />
      </span>
      <span className="text-base font-bold">
        {isEmpty ? "Aún no hay usuarios" : "Sin resultados"}
      </span>
      <span className="max-w-[360px] text-sm leading-normal text-ink-muted">
        {isEmpty
          ? "Crea el primero con “Nuevo usuario” y asígnale un rol."
          : "Ningún usuario coincide con la búsqueda o el filtro. Prueba con otro término."}
      </span>
    </div>
  );
}
