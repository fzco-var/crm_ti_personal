"use client";

import { useId } from "react";
import {
  FieldError,
  type ClientFieldsProps,
} from "@/features/clients/components/form-field";
import { RoleBadge } from "@/features/clients/components/role-badge";
import { CLIENT_ROLES } from "@/features/clients/constants";

export function RoleFields({
  values,
  errors,
  onChange,
  original,
}: ClientFieldsProps) {
  const id = useId();
  const headingId = `${id}-heading`;
  const legendId = `${id}-legend`;
  const errorId = `${id}-error`;

  return (
    <section aria-labelledby={headingId} className="crm-card gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="crm-heading">
          Rol en la empresa
        </h2>
        <p className="text-sm text-ink-muted">
          {original && values.role !== original.role
            ? `Cambiará de ${original.role} a ${values.role} al guardar.`
            : "Para saber a quién acudir según el tema."}
        </p>
      </div>
      {/* `radiogroup` admite `aria-invalid`; el rol nativo de `fieldset`, no. */}
      <fieldset
        role="radiogroup"
        aria-labelledby={legendId}
        aria-invalid={errors.role ? true : undefined}
        aria-describedby={errors.role ? errorId : undefined}
        className="relative grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3"
      >
        <legend id={legendId} className="sr-only">
          Rol del contacto
        </legend>
        {CLIENT_ROLES.map(({ value, description }) => (
          <label
            key={value}
            className={`crm-option has-disabled:cursor-not-allowed ${errors.role ? "border-danger" : ""}`}
          >
            <input
              type="radio"
              name={id}
              value={value}
              checked={values.role === value}
              onChange={() => onChange({ role: value })}
            />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-2">
                <RoleBadge role={value} />
                {original?.role === value && (
                  <span className="text-xs text-ink-muted">actual</span>
                )}
              </span>
              <span className="text-compact leading-[1.45] text-ink-soft">
                {description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <FieldError id={errorId}>{errors.role}</FieldError>
    </section>
  );
}
