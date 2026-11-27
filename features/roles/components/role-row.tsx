"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  CopyIcon,
  LockIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";
import { RoleBadge } from "@/features/roles/components/role-badge";
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  PERMISSION_TOTAL,
} from "@/features/roles/constants";
import type { Role } from "@/features/roles/types/role";
import {
  canDeleteRole,
  countModulePermissions,
  getModuleSummary,
  toPermissionKey,
} from "@/features/roles/utils";
import { CURRENT_USER_ID } from "@/features/users/constants";
import type { User } from "@/features/users/types/user";
import { getInitials } from "@/lib/text";

const MAX_AVATARS = 4;

function getUsersText(count: number) {
  if (count === 0) return "Sin usuarios";
  return count === 1 ? "1 usuario" : `${count} usuarios`;
}

function getDeleteTitle(role: Role, userCount: number) {
  if (role.system) return "Los roles del sistema no se pueden eliminar";
  if (userCount > 0) {
    return `Reasigna a sus ${userCount} usuarios antes de eliminarlo`;
  }
  return "Eliminar rol";
}

/** Fila del listado; `editable` es falso en las copias, que no tienen página. */
export function RoleRow({
  role,
  users,
  editable,
  open,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  role: Role;
  users: User[];
  editable: boolean;
  open: boolean;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const count = role.permissions.length;
  const deletable = canDeleteRole(role, users.length);

  return (
    <li className="border-b border-line-soft">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-4.5">
        <div className="flex min-w-0 flex-[3_1_280px] flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <RoleBadge role={role} />
            <span className="font-mono text-xs text-ink-muted">{role.key}</span>
            {role.system && (
              <span className="inline-flex h-5.5 items-center gap-1 rounded-md border border-line px-2 text-2xs font-bold tracking-[0.04em] text-ink-muted uppercase">
                <LockIcon size={11} strokeWidth={2.4} />
                Sistema
              </span>
            )}
          </span>
          <span className="text-sm leading-[1.45] text-ink-soft">
            {role.description}
          </span>
        </div>

        <div className="flex flex-[1_1_150px] flex-col gap-1.5">
          <span className="text-xs font-bold tracking-[0.04em] text-ink-muted uppercase">
            Permisos
          </span>
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-1.5 max-w-[90px] flex-1 overflow-hidden rounded-[3px] bg-line-soft"
            >
              <span
                className="h-full rounded-[3px] bg-ink"
                style={{
                  width: `${Math.round((count / PERMISSION_TOTAL) * 100)}%`,
                }}
              />
            </span>
            <span className="font-mono text-compact">
              {count}/{PERMISSION_TOTAL}
            </span>
          </span>
        </div>

        <div className="flex flex-[1_1_150px] flex-col gap-1.5">
          <span className="text-xs font-bold tracking-[0.04em] text-ink-muted uppercase">
            Usuarios
          </span>
          <span className="flex items-center gap-2.5">
            {users.length > 0 && (
              <span aria-hidden="true" className="flex">
                {users.slice(0, MAX_AVATARS).map((user) => (
                  <span
                    key={user.id}
                    className={`-mr-2 flex size-7 items-center justify-center rounded-full border-2 border-surface font-mono text-[10px] font-medium ${
                      user.id === CURRENT_USER_ID
                        ? "bg-ink text-white"
                        : "bg-canvas text-ink-soft"
                    }`}
                  >
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                ))}
              </span>
            )}
            <span
              className={`text-compact text-ink-soft ${users.length > 0 ? "ml-2" : ""}`}
            >
              {getUsersText(users.length)}
            </span>
          </span>
        </div>

        <div className="ml-auto flex flex-none items-center gap-1">
          <button
            type="button"
            className="crm-btn crm-btn-secondary crm-btn-sm whitespace-nowrap"
            aria-expanded={open}
            onClick={onToggle}
          >
            {open ? "Ocultar permisos" : "Ver permisos"}
            <ChevronDownIcon
              size={14}
              className={open ? "rotate-180" : undefined}
            />
          </button>
          {editable && (
            <Link
              href={`/roles/${role.id}`}
              className="crm-icon-btn"
              aria-label={`Editar rol ${role.name}`}
            >
              <PencilIcon size={18} />
            </Link>
          )}
          <button
            type="button"
            className="crm-icon-btn"
            aria-label={`Duplicar rol ${role.name}`}
            onClick={onDuplicate}
          >
            <CopyIcon size={18} />
          </button>
          <button
            type="button"
            className="crm-icon-btn enabled:text-danger"
            aria-label={`Eliminar rol ${role.name}`}
            title={getDeleteTitle(role, users.length)}
            disabled={!deletable}
            onClick={onDelete}
          >
            <TrashIcon size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-5 mb-4.5 flex flex-col gap-3 rounded-xl bg-surface-muted p-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-2.5">
            {PERMISSION_MODULES.map((module) => {
              const empty =
                countModulePermissions(role.permissions, module.id) === 0;
              return (
                <div
                  key={module.id}
                  className="flex flex-col gap-2 rounded-[10px] border border-line bg-surface p-3"
                >
                  <span className="flex justify-between gap-2 text-compact">
                    <span className="font-bold">{module.label}</span>
                    <span
                      className={`font-mono ${empty ? "text-ink-muted" : "text-ink"}`}
                    >
                      {getModuleSummary(role.permissions, module.id, "short")}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {PERMISSION_ACTIONS.map((action) => {
                      const granted = role.permissions.includes(
                        toPermissionKey(module.id, action.id),
                      );
                      return (
                        <span
                          key={action.id}
                          className={`inline-flex h-5.5 items-center rounded-md px-2 text-2xs font-bold ${
                            granted
                              ? "bg-ink text-white"
                              : "bg-canvas text-ink-muted line-through"
                          }`}
                        >
                          {action.label}
                        </span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </div>
          {!role.system && users.length > 0 && (
            <span className="text-compact text-ink-muted">
              Para eliminar este rol, primero reasigna a sus usuarios a otro rol
              desde{" "}
              <Link href="/users" className="font-bold text-ink">
                Usuarios
              </Link>
              .
            </span>
          )}
        </div>
      )}
    </li>
  );
}
