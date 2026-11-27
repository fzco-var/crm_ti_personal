"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { LockIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { RoleRow } from "@/features/roles/components/role-row";
import type { Role } from "@/features/roles/types/role";
import {
  findRoleById,
  getRoleUsers,
  getRolesSummaryText,
  matchesRoleSearch,
} from "@/features/roles/utils";

/**
 * Copias y eliminaciones son locales; Activity las conserva al volver, junto
 * con la búsqueda y la fila abierta.
 */
export function RolesList({ roles }: { roles: Role[] }) {
  const searchId = useId();
  const [list, setList] = useState(roles);
  // "Deshacer" solo vuelve atrás el último cambio.
  const [undoList, setUndoList] = useState<Role[] | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(
    () => roles.find((role) => role.key === "tecnico")?.id ?? null,
  );
  const copyCount = useRef(0);

  function closeNotice() {
    setNotice("");
    setUndoList(null);
  }

  // Al salir, Activity conserva el estado; el aviso es lo único que se cierra.
  useLayoutEffect(() => () => closeNotice(), []);

  const visibleRoles = list.filter((role) => matchesRoleSearch(role, search));

  function duplicate(role: Role) {
    copyCount.current += 1;
    // Las copias no tienen UUID ni página.
    const copy: Role = {
      ...role,
      id: `copia-${copyCount.current}`,
      key: `${role.key}_copia`,
      name: `Copia de ${role.name}`,
      system: false,
    };
    const index = list.indexOf(role);
    setUndoList(list);
    setList([...list.slice(0, index + 1), copy, ...list.slice(index + 1)]);
    setNotice(`Creaste «${copy.name}».`);
  }

  function remove(role: Role) {
    setUndoList(list);
    setList(list.filter((other) => other.id !== role.id));
    setNotice(`Rol «${role.name}» eliminado.`);
  }

  function undo() {
    if (!undoList) return;
    setList(undoList);
    setUndoList(null);
    setNotice("Cambio deshecho.");
  }

  return (
    <div className="crm-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[{ label: "Configuración" }, { label: "Roles y permisos" }]}
          />
          <h1 className="crm-title">Roles y permisos</h1>
          <p className="text-sm text-ink-muted">{getRolesSummaryText(list)}</p>
        </div>
        <Link href="/roles/new" className="crm-btn crm-btn-primary">
          <PlusIcon />
          Nuevo rol
        </Link>
      </div>

      {notice && (
        <Alert
          variant="success"
          onClose={closeNotice}
          action={
            undoList && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-secondary border-tone-green-line text-tone-green-fg"
                onClick={undo}
              >
                Deshacer
              </button>
            )
          }
        >
          {notice}
        </Alert>
      )}

      <section
        aria-label="Listado de roles"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="relative flex max-w-[380px] flex-[1_1_280px]">
            <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
            <label htmlFor={searchId} className="sr-only">
              Buscar roles
            </label>
            <input
              id={searchId}
              type="search"
              className="crm-field crm-field-sm pl-[42px]"
              placeholder="Buscar por nombre o clave"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="flex items-center gap-1.5 text-compact text-ink-muted">
            <LockIcon size={14} />
            Sistema: no se pueden eliminar
          </span>
        </div>

        {visibleRoles.length > 0 ? (
          <ul>
            {visibleRoles.map((role) => {
              const editable = Boolean(findRoleById(role.id));
              return (
                <RoleRow
                  key={role.id}
                  role={role}
                  users={editable ? getRoleUsers(role.id) : []}
                  editable={editable}
                  open={openId === role.id}
                  onToggle={() =>
                    setOpenId(openId === role.id ? null : role.id)
                  }
                  onDuplicate={() => duplicate(role)}
                  onDelete={() => remove(role)}
                />
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
              <SearchIcon size={22} />
            </span>
            <span className="text-base font-bold">Sin resultados</span>
            <span className="max-w-[360px] text-sm leading-normal text-ink-muted">
              Ningún rol coincide con «{search}».
            </span>
          </div>
        )}

        <div className="border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          Mostrando {visibleRoles.length} de {list.length} roles
        </div>
      </section>
    </div>
  );
}
