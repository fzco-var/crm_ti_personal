"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { FieldError, FieldLabel, TextField } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import type { ClientFieldsProps } from "@/features/clients/components/form-field";
import { PHONE_PREFIXES } from "@/features/clients/constants";
import {
  findClientByEmail,
  findCompany,
  formatContactCount,
  formatPhone,
  getCompanyInitials,
  getPhonePrefix,
  isValidPhone,
  suggestCompanies,
} from "@/features/clients/utils";

export function ContactFields(props: ClientFieldsProps) {
  const { values, errors, onChange, original } = props;
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="crm-card">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="crm-heading">
          Contacto
        </h2>
        {!original && (
          <p className="text-sm text-ink-muted">La persona con quien hablas.</p>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
        <TextField
          label="Nombre"
          placeholder={original ? undefined : "Ej. Andrea"}
          value={values.firstName}
          error={errors.firstName}
          modified={original && values.firstName !== original.firstName}
          onChange={(event) => onChange({ firstName: event.target.value })}
        />
        <TextField
          label="Apellido"
          placeholder={original ? undefined : "Ej. Valdés"}
          value={values.lastName}
          error={errors.lastName}
          modified={original && values.lastName !== original.lastName}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
      </div>

      <CompanyField {...props} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
        <PhoneField {...props} />
        <EmailField {...props} />
      </div>
    </section>
  );
}

function CompanyField({
  values,
  errors,
  onChange,
  original,
}: ClientFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = suggestCompanies(values.company);

  return (
    <TextField
      ref={inputRef}
      label="Nombre de la empresa"
      placeholder={
        original ? undefined : "Escribe para buscar o crear una empresa"
      }
      value={values.company}
      error={errors.company}
      modified={original && values.company !== original.company}
      onChange={(event) => onChange({ company: event.target.value })}
    >
      {suggestions.length > 0 ? (
        <ul
          aria-label="Empresas existentes"
          className="flex flex-col gap-0.5 rounded-control border border-line bg-surface p-1.5 shadow-popover"
        >
          {suggestions.map(({ name, contactCount }) => (
            <li key={name}>
              <button
                type="button"
                className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-muted"
                onClick={() => {
                  onChange({ company: name });
                  // La lista desaparece: el foco vuelve al campo.
                  inputRef.current?.focus();
                }}
              >
                {!original && (
                  <span
                    aria-hidden="true"
                    className="flex size-7 flex-none items-center justify-center rounded-[7px] border border-line bg-canvas font-mono text-2xs text-ink-soft"
                  >
                    {getCompanyInitials(name)}
                  </span>
                )}
                <span className="flex-1 text-sm font-semibold">{name}</span>
                <span className="text-xs text-ink-muted">
                  {formatContactCount(contactCount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <CompanyHint
          company={values.company}
          originalCompany={original?.company}
        />
      )}
    </TextField>
  );
}

function CompanyHint({
  company,
  originalCompany,
}: {
  company: string;
  originalCompany?: string;
}) {
  const match = findCompany(company);

  if (!company.trim() || company === originalCompany) return null;

  if (originalCompany !== undefined) {
    return (
      <span className="text-compact leading-[1.45] text-tone-amber-fg">
        Se moverá de <strong>{originalCompany}</strong> a{" "}
        <strong>{company}</strong>
        {!match && " (empresa nueva)"}. Sus tickets abiertos quedan en la
        empresa anterior.
      </span>
    );
  }

  if (match) {
    return (
      <span className="flex flex-wrap items-center gap-2 text-compact text-tone-green-fg">
        <CheckIcon size={14} />
        Empresa existente · {formatContactCount(match.contactCount)} ·{" "}
        {match.city}
      </span>
    );
  }

  return (
    <span className="text-compact text-ink-muted">
      Se creará la empresa «{company}» al guardar.
    </span>
  );
}

function PhoneField({ values, errors, onChange, original }: ClientFieldsProps) {
  const id = useId();
  const prefixId = `${id}-prefix`;
  const errorId = `${id}-error`;
  const { phonePrefix, phone } = values;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={id}
        modified={
          original &&
          (phone !== original.phone || phonePrefix !== original.phonePrefix)
        }
      >
        Número de teléfono
      </FieldLabel>
      <div className="relative flex gap-2">
        <label htmlFor={prefixId} className="sr-only">
          Código de país
        </label>
        <select
          id={prefixId}
          className="crm-field w-auto flex-none px-2.5 font-mono text-sm"
          value={phonePrefix}
          onChange={(event) => onChange({ phonePrefix: event.target.value })}
        >
          {PHONE_PREFIXES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          className="crm-field flex-1 font-mono text-sm"
          placeholder={
            original ? undefined : getPhonePrefix(phonePrefix).placeholder
          }
          value={phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? errorId : undefined}
          onChange={(event) => onChange({ phone: event.target.value })}
        />
      </div>
      <FieldError id={errorId}>{errors.phone}</FieldError>
      {!original && isValidPhone(phonePrefix, phone) && (
        <span className="crm-code text-ink-muted">
          Se guardará como {formatPhone(phonePrefix, phone)}
        </span>
      )}
    </div>
  );
}

function EmailField({ values, errors, onChange, original }: ClientFieldsProps) {
  const duplicate = findClientByEmail(values.email, original?.id);
  const duplicateName =
    duplicate && `${duplicate.firstName} ${duplicate.lastName}`;

  return (
    <TextField
      label="Correo"
      type="email"
      placeholder={original ? undefined : "nombre@empresa.com"}
      value={values.email}
      error={errors.email}
      modified={original && values.email !== original.email}
      onChange={(event) => onChange({ email: event.target.value })}
    >
      {duplicate && (
        <span className="text-compact leading-[1.45] text-tone-amber-fg">
          {original ? (
            <>
              Ese correo ya lo usa <strong>{duplicateName}</strong>.
            </>
          ) : (
            <>
              Ya existe un contacto con este correo:{" "}
              <strong>{duplicateName}</strong>.{" "}
              <Link
                href={`/clients/${duplicate.id}`}
                className="crm-hit font-bold text-tone-amber-fg underline"
              >
                Ver contacto
              </Link>
            </>
          )}
        </span>
      )}
    </TextField>
  );
}
