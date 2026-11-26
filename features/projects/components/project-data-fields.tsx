"use client";

import Link from "next/link";
import { useId } from "react";
import { FieldError, FieldLabel, TextField } from "@/components/form-field";
import { clients } from "@/data/clients";
import type { ProjectFormValues } from "@/features/projects/types/project";
import {
  findProjectClient,
  formatProjectCount,
  getProjectsByClient,
} from "@/features/projects/utils";

export type ProjectDataErrors = Partial<Record<"name" | "clientId", string>>;

// Contactos agrupados por empresa, en el orden de `data/clients.ts`.
const CLIENT_GROUPS = Object.entries(
  Object.groupBy(clients, ({ company }) => company),
);

interface ProjectDataFieldsProps {
  values: ProjectFormValues;
  errors: ProjectDataErrors;
  onChange: (changes: Partial<ProjectFormValues>) => void;
  /** Solo en el alta: el código que tendrá el proyecto. */
  code?: string;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ProjectFormValues;
  disabled?: boolean;
}

/** Nombre, código (en el alta), cliente y descripción. */
export function ProjectDataFields({
  values,
  errors,
  onChange,
  code,
  original,
  disabled,
}: ProjectDataFieldsProps) {
  const id = useId();
  const nameField = (
    <TextField
      label="Nombre del proyecto"
      placeholder={original ? undefined : "Ej. Portal de clientes en Next.js"}
      value={values.name}
      error={errors.name}
      modified={original && values.name !== original.name}
      disabled={disabled}
      onChange={(event) => onChange({ name: event.target.value })}
    />
  );

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Datos del proyecto
      </h2>

      {code ? (
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(140px,1fr)] gap-5">
          {nameField}
          <div className="flex flex-col gap-1.5">
            <span className="crm-label">Código</span>
            <span className="flex h-[46px] items-center rounded-control border border-line bg-surface-muted px-3.5 font-mono text-sm text-ink-soft">
              {code}
            </span>
          </div>
        </div>
      ) : (
        nameField
      )}

      <ClientField
        values={values}
        error={errors.clientId}
        original={original}
        disabled={disabled}
        onChange={(clientId) => onChange({ clientId })}
      />

      <div className="flex flex-col gap-1.5">
        <FieldLabel
          htmlFor={`${id}-description`}
          modified={original && values.description !== original.description}
        >
          Descripción
          {!original && (
            <span className="font-medium text-ink-muted"> (opcional)</span>
          )}
        </FieldLabel>
        <textarea
          id={`${id}-description`}
          rows={3}
          className="crm-textarea"
          placeholder={
            original ? undefined : "Alcance, objetivos y lo que queda fuera."
          }
          value={values.description}
          disabled={disabled}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </div>
    </section>
  );
}

/**
 * En el alta, el contacto elegido muestra cuántos proyectos tiene. En la
 * edición, un contacto de otra empresa avisa del cambio de empresa.
 */
function ClientField({
  values,
  error,
  original,
  disabled,
  onChange,
}: {
  values: ProjectFormValues;
  error?: string;
  original?: ProjectFormValues;
  disabled?: boolean;
  onChange: (clientId: string) => void;
}) {
  const id = useId();
  const client = findProjectClient(values.clientId);
  const originalClient = original && findProjectClient(original.clientId);
  const changesCompany =
    client && originalClient && client.company !== originalClient.company;

  let hint = "";
  if (changesCompany) {
    hint = `Pasará de ${originalClient.company} a ${client.company}.`;
  } else if (client && original) {
    hint = `${client.company} · ${client.role}`;
  } else if (client) {
    const count = getProjectsByClient(client.id).length;
    hint = `${client.company} · ${client.role} · ${formatProjectCount(count)} con este contacto`;
  }

  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={`${id}-client`}
        modified={original && values.clientId !== original.clientId}
      >
        Cliente
      </FieldLabel>
      <select
        id={`${id}-client`}
        className="crm-field px-3"
        value={values.clientId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {!original && <option value="">Elige un cliente</option>}
        {CLIENT_GROUPS.map(([company, contacts = []]) => (
          <optgroup key={company} label={company}>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName} · {contact.role}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
      {hint && (
        <span
          id={`${id}-hint`}
          className={`text-compact ${changesCompany ? "text-tone-amber-fg" : "text-ink-muted"}`}
        >
          {hint}
        </span>
      )}
      {!original && (
        <Link
          href="/clients/new"
          className="crm-link self-start text-compact font-bold"
        >
          ¿No está? Crear un cliente nuevo
        </Link>
      )}
    </div>
  );
}
