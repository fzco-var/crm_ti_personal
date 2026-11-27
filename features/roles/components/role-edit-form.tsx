"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { FieldLabel, TextField } from "@/components/form-field";
import { CheckIcon, LockIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { PermissionMatrix } from "@/features/roles/components/permission-matrix";
import { RoleBadge } from "@/features/roles/components/role-badge";
import { RoleChanges } from "@/features/roles/components/role-changes";
import { RoleUsers } from "@/features/roles/components/role-users";
import type { Role, RoleFormValues } from "@/features/roles/types/role";
import {
  type RoleNameError,
  getRoleFormChanges,
  getRoleNameError,
  getRoleUsers,
  isAdminRole,
} from "@/features/roles/utils";
import { addDays, formatDate } from "@/features/tickets/utils";

const NAME_MESSAGES: Record<RoleNameError, string> = {
  empty: "El nombre no puede quedar vacío.",
  tooLong: "Usa 20 caracteres o menos.",
  taken: "Ya existe un rol con ese nombre.",
};

function toFormValues(role: Role): RoleFormValues {
  return {
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  };
}

/** "hoy" con 0 días; si no, "02 jun 2026". */
function formatDaysAgo(today: string, daysAgo: number) {
  return daysAgo === 0 ? "hoy" : formatDate(addDays(today, -daysAgo));
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "nombre · descripción · 2 permisos añadidos, 1 quitado". */
function getChangesText(changes: ReturnType<typeof getRoleFormChanges>) {
  const parts: string[] = [];
  if (changes.name) parts.push("nombre");
  if (changes.description) parts.push("descripción");
  if (changes.added.length > 0 || changes.removed.length > 0) {
    parts.push(
      `${pluralize(changes.added.length, "permiso añadido", "permisos añadidos")}, ${pluralize(
        changes.removed.length,
        "quitado",
        "quitados",
      )}`,
    );
  }
  return parts.join(" · ");
}

/**
 * `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás.
 * Las fechas dependen del día del navegador: sin él, no hay formulario.
 */
export function RoleEditForm({ role }: { role: Role }) {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando rol…
        </p>
      </div>
    );
  }
  return <EditForm key={bfcacheId} role={role} today={today} />;
}

function EditForm({ role, today }: { role: Role; today: string }) {
  const id = useId();
  // El rol guardado; "Guardar cambios" lo reemplaza sin persistir.
  const [saved, setSaved] = useState(role);
  const original = toFormValues(saved);
  const [values, setValues] = useState(original);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");

  const locked = isAdminRole(saved);
  const users = getRoleUsers(saved.id);
  const changes = getRoleFormChanges(original, values);
  const permissionsChanged =
    changes.added.length > 0 || changes.removed.length > 0;
  const dirty = changes.name || changes.description || permissionsChanged;
  const nameErrorCode = getRoleNameError(values.name, saved.id);
  const nameError =
    tried && nameErrorCode ? NAME_MESSAGES[nameErrorCode] : undefined;

  function change(patch: Partial<RoleFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function save() {
    if (nameErrorCode) {
      setTried(true);
      return;
    }
    const next = { ...values, name: values.name.trim() };
    setSaved({ ...saved, ...next, updatedDaysAgo: 0 });
    setValues(next);
    setTried(false);
    setNotice(
      permissionsChanged && users.length > 0
        ? `Rol «${next.name}» actualizado. Afecta a ${pluralize(users.length, "usuario", "usuarios")}.`
        : `Rol «${next.name}» actualizado.`,
    );
  }

  function discard() {
    setValues(original);
    setTried(false);
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb
            items={[
              { label: "Configuración" },
              { label: "Roles y permisos", href: "/roles" },
              { label: saved.name },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="crm-title">Editar rol</h1>
            <RoleBadge role={saved} />
            {saved.system && (
              <span className="inline-flex h-6 items-center gap-1 rounded-md border border-line bg-surface px-2 text-2xs font-bold tracking-[0.04em] text-ink-muted uppercase">
                <LockIcon size={11} strokeWidth={2.4} />
                Sistema
              </span>
            )}
          </div>
          <span className="text-sm text-ink-muted">
            Creado el {formatDate(addDays(today, -saved.createdDaysAgo))} ·
            última modificación {formatDaysAgo(today, saved.updatedDaysAgo)} por
            Martín Vidal
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/roles" className="crm-btn crm-btn-secondary">
            Volver
          </Link>
          <button
            type="submit"
            className="crm-btn crm-btn-primary"
            disabled={!dirty}
          >
            <CheckIcon />
            Guardar cambios
          </button>
        </div>
      </div>

      {dirty && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
        >
          <span className="size-2 rounded-full bg-accent" />
          <span className="min-w-0 flex-[1_1_220px]">
            Cambios sin guardar: {getChangesText(changes)}
          </span>
          <button
            type="button"
            className="crm-btn crm-btn-sm crm-btn-secondary"
            onClick={discard}
          >
            Descartar
          </button>
        </div>
      )}

      {notice && (
        <Alert variant="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <section aria-labelledby={`${id}-data`} className="crm-card">
            <h2 id={`${id}-data`} className="crm-heading">
              Datos del rol
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
              <TextField
                label="Nombre del rol"
                value={values.name}
                error={nameError}
                modified={changes.name}
                readOnly={saved.system}
                className={`crm-field ${
                  saved.system ? "border-line bg-surface-muted" : ""
                }`}
                onChange={(event) => change({ name: event.target.value })}
              >
                {saved.system && (
                  <span className="text-compact text-ink-muted">
                    Los roles del sistema no se pueden renombrar.
                  </span>
                )}
              </TextField>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="crm-label">Clave interna</span>
                <span className="flex h-[46px] items-center gap-2 overflow-hidden rounded-control border border-line bg-surface-muted px-3.5 font-mono text-sm text-ink-soft">
                  <LockIcon size={14} className="flex-none text-ink-muted" />
                  <span className="truncate">{saved.key}</span>
                </span>
                <span className="text-compact text-ink-muted">
                  No cambia al renombrar, para no romper el backend.
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor={`${id}-description`}
                modified={changes.description}
                modifiedText="modificada"
              >
                Descripción
              </FieldLabel>
              <textarea
                id={`${id}-description`}
                rows={2}
                className="crm-textarea"
                value={values.description}
                onChange={(event) =>
                  change({ description: event.target.value })
                }
              />
            </div>
          </section>

          <section
            aria-labelledby={`${id}-permissions`}
            className="crm-card gap-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 id={`${id}-permissions`} className="crm-heading">
                  Permisos
                </h2>
                <p className="text-sm text-ink-muted">
                  Las casillas con borde de color cambiaron respecto a lo
                  guardado.
                </p>
              </div>
              {!locked && (
                <button
                  type="button"
                  className="crm-btn crm-btn-sm crm-btn-secondary"
                  disabled={!permissionsChanged}
                  onClick={() => change({ permissions: original.permissions })}
                >
                  Restaurar permisos
                </button>
              )}
            </div>
            {locked && (
              <div
                role="note"
                className="flex items-start gap-2.5 rounded-control border border-line bg-surface-muted px-3.5 py-3 text-sm leading-[1.45] text-ink-soft"
              >
                <LockIcon size={18} className="mt-px flex-none" />
                <span>
                  El rol Administrador siempre tiene acceso total, así nunca te
                  quedas fuera del CRM.
                </span>
              </div>
            )}
            <PermissionMatrix
              permissions={values.permissions}
              savedPermissions={original.permissions}
              disabled={locked}
              onChange={(permissions) => change({ permissions })}
            />
          </section>
        </div>
        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
          <RoleChanges
            savedPermissions={original.permissions}
            permissions={values.permissions}
            userCount={users.length}
          />
          <RoleUsers users={users} />
        </aside>
      </div>
    </form>
  );
}
