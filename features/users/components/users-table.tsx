"use client";

import Link from "next/link";
import { PencilIcon, ResetIcon } from "@/components/icons";
import { RoleBadge } from "@/features/users/components/role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import { CURRENT_USER_ID } from "@/features/users/constants";
import type { User } from "@/features/users/types/user";
import {
  formatPasswordAge,
  getFullName,
  getUserRole,
} from "@/features/users/utils";
import { getInitials } from "@/lib/text";

const COLUMNS = [
  { label: "Nombre y apellido", className: "pl-5" },
  { label: "Usuario", className: "" },
  { label: "Email", className: "" },
  { label: "Contraseña", className: "" },
  { label: "Rol", className: "" },
];

export function UsersTable({
  users,
  onResetPassword,
}: {
  users: User[];
  onResetPassword: (user: User) => void;
}) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table min-w-[900px]">
        <thead>
          <tr>
            {COLUMNS.map(({ label, className }) => (
              <th
                key={label}
                scope="col"
                className={`whitespace-nowrap ${className}`}
              >
                {label}
              </th>
            ))}
            {/* `relative` evita que el texto oculto desborde la página. */}
            <th scope="col" className="relative w-[60px]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onResetPassword={() => onResetPassword(user)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({
  user,
  onResetPassword,
}: {
  user: User;
  onResetPassword: () => void;
}) {
  const name = getFullName(user);
  const isCurrent = user.id === CURRENT_USER_ID;
  const role = getUserRole(user);

  return (
    <tr>
      <th scope="row" className="pl-5">
        <span className="flex items-center gap-3">
          <span
            className={`flex size-9 flex-none items-center justify-center rounded-full font-mono text-xs font-medium ${
              isCurrent ? "bg-ink text-white" : "bg-canvas text-ink-soft"
            }`}
          >
            {getInitials(user.firstName, user.lastName)}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <Link
                href={`/users/${user.id}`}
                className={`font-bold whitespace-nowrap underline-offset-[3px] hover:underline ${
                  user.active ? "text-ink" : "text-ink-muted"
                }`}
              >
                {name}
              </Link>
              {!user.active && <UserStatusBadge active={false} />}
            </span>
            {isCurrent && (
              <span className="text-xs font-normal text-ink-muted">Tú</span>
            )}
          </span>
        </span>
      </th>
      <td className="font-mono text-[13px] whitespace-nowrap text-ink-soft">
        @{user.username}
      </td>
      <td className="whitespace-nowrap text-ink-soft">{user.email}</td>
      <td className="py-2.5">
        <span className="flex items-center gap-3">
          <span className="flex flex-col gap-0.5">
            <span className="font-mono tracking-[0.1em] text-ink">
              <span aria-hidden="true">••••••••</span>
              <span className="sr-only">Contraseña oculta</span>
            </span>
            <span
              className={`text-xs whitespace-nowrap ${
                user.passwordTemporary ? "text-warning" : "text-ink-muted"
              }`}
            >
              {user.passwordTemporary
                ? "Temporal, aún sin cambiar"
                : `Cambiada ${formatPasswordAge(user.passwordChangedDaysAgo)}`}
            </span>
          </span>
          <button
            type="button"
            className="crm-btn crm-btn-secondary crm-btn-sm ml-auto whitespace-nowrap"
            aria-label={`Restablecer contraseña de ${name}`}
            disabled={!user.active}
            onClick={onResetPassword}
          >
            <ResetIcon />
            Restablecer
          </button>
        </span>
      </td>
      <td className="whitespace-nowrap">{role && <RoleBadge role={role} />}</td>
      <td className="py-2 pr-5 pl-2">
        <Link
          href={`/users/${user.id}`}
          className="crm-icon-btn"
          aria-label={`Editar a ${name}`}
        >
          <PencilIcon />
        </Link>
      </td>
    </tr>
  );
}
