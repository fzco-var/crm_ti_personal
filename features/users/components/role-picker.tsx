"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { Alert } from "@/components/alert";
import { FieldError } from "@/components/form-field";
import { RoleBadge } from "@/features/roles/components/role-badge";
import { PERMISSION_TOTAL } from "@/features/roles/constants";
import type { Role } from "@/features/roles/types/role";
import { getRoleName } from "@/features/roles/utils";

/**
 * Sección "Rol" con radios nativos: las flechas del teclado cambian el rol.
 * En la edición, `savedRoleId` marca "actual" y anuncia el cambio.
 */
export function RolePicker({
  roles,
  value,
  onChange,
  savedRoleId,
  error,
  adminWarning = false,
  disabled = false,
  legend,
  children,
}: {
  roles: Role[];
  value: string;
  onChange: (roleId: string) => void;
  savedRoleId?: string;
  error?: string;
  /** Aviso al elegir Administrador, solo en el alta. */
  adminWarning?: boolean;
  disabled?: boolean;
  legend: string;
  /** Nota debajo de las tarjetas, como la de la cuenta propia. */
  children?: ReactNode;
}) {
  const id = useId();
  const headingId = `${id}-heading`;
  const legendId = `${id}-legend`;
  const errorId = `${id}-error`;
  const selected = roles.find((role) => role.id === value);
  const changed = Boolean(savedRoleId && value !== savedRoleId);

  return (
    <section aria-labelledby={headingId} className="crm-card gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={headingId} className="crm-heading">
            Rol
          </h2>
          <p className="text-sm text-ink-muted">
            {changed && savedRoleId
              ? `Cambiará de ${getRoleName(savedRoleId)} a ${getRoleName(value)} al guardar.`
              : "Define qué podrá ver y hacer."}
          </p>
        </div>
        <Link href="/roles/new" className="crm-link text-sm font-bold">
          Crear un rol nuevo
        </Link>
      </div>
      {/* `radiogroup` admite `aria-invalid`; el rol nativo de `fieldset`, no. */}
      <fieldset
        role="radiogroup"
        aria-labelledby={legendId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        className="relative grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3"
      >
        <legend id={legendId} className="sr-only">
          {legend}
        </legend>
        {roles.map((role) => (
          <label
            key={role.id}
            className={`crm-option has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
              error ? "border-danger" : ""
            }`}
          >
            <input
              type="radio"
              name={id}
              value={role.id}
              checked={value === role.id}
              onChange={() => onChange(role.id)}
            />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-2">
                <RoleBadge role={role} />
                {savedRoleId === role.id && (
                  <span className="text-xs text-ink-muted">actual</span>
                )}
              </span>
              <span className="text-compact leading-[1.45] text-ink-soft">
                {role.description}
              </span>
              <span className="font-mono text-xs text-ink-muted">
                {role.permissions.length} de {PERMISSION_TOTAL} permisos
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <FieldError id={errorId}>{error}</FieldError>
      {adminWarning && selected?.key === "administrador" && (
        <Alert variant="warning">
          Un administrador tiene acceso total, incluida la gestión de usuarios y
          roles.
        </Alert>
      )}
      {children}
    </section>
  );
}
