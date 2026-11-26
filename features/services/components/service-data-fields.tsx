"use client";

import { useId } from "react";
import { FieldError, FieldLabel, TextField } from "@/components/form-field";
import { clients } from "@/data/clients";
import { SERVICE_TYPES } from "@/features/services/constants";
import type { ServiceFormValues } from "@/features/services/types/service";
import { getCompanyProjects, getFormProvider } from "@/features/services/utils";

export type ServiceDataErrors = Partial<
  Record<"name" | "provider" | "clientId", string>
>;

// Contactos agrupados por empresa, como en el alta de proyectos.
const CLIENT_GROUPS = Object.entries(
  Object.groupBy(clients, ({ company }) => company),
);

interface ServiceDataFieldsProps {
  values: ServiceFormValues;
  errors: ServiceDataErrors;
  onChange: (changes: Partial<ServiceFormValues>) => void;
  /** Valores guardados. Solo en la edición: oculta el cliente y marca los cambios. */
  original?: ServiceFormValues;
  disabled?: boolean;
}

/** Nombre, proveedor, cliente (solo en el alta) y proyecto. */
export function ServiceDataFields({
  values,
  errors,
  onChange,
  original,
  disabled,
}: ServiceDataFieldsProps) {
  const id = useId();
  const isMaintenance = values.type === "Mantención";
  const namePlaceholder = SERVICE_TYPES.find(
    ({ value }) => value === values.type,
  )?.placeholder;

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Datos del servicio
      </h2>

      <TextField
        label="Nombre del servicio"
        placeholder={original ? undefined : namePlaceholder}
        value={values.name}
        error={errors.name}
        modified={original && values.name !== original.name}
        disabled={disabled}
        onChange={(event) => onChange({ name: event.target.value })}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
        <TextField
          label="Proveedor"
          placeholder={
            original || isMaintenance
              ? undefined
              : "Ej. Vercel, DigitalOcean, NIC Chile"
          }
          className={`crm-field ${isMaintenance ? "border-line bg-surface-muted" : ""}`}
          value={getFormProvider(values)}
          readOnly={isMaintenance}
          error={errors.provider}
          modified={original && values.provider !== original.provider}
          disabled={disabled}
          onChange={(event) => onChange({ provider: event.target.value })}
        >
          {isMaintenance && (
            <span className="text-compact text-ink-muted">
              Las mantenciones las prestas tú.
            </span>
          )}
        </TextField>

        {original ? (
          <ProjectField
            values={values}
            original={original}
            disabled={disabled}
            onChange={onChange}
          />
        ) : (
          <ClientField
            values={values}
            error={errors.clientId}
            disabled={disabled}
            onChange={onChange}
          />
        )}
      </div>

      {!original && (
        <ProjectField values={values} disabled={disabled} onChange={onChange} />
      )}
    </section>
  );
}

/** Cambiar de cliente vacía el proyecto. */
function ClientField({
  values,
  error,
  disabled,
  onChange,
}: {
  values: ServiceFormValues;
  error?: string;
  disabled?: boolean;
  onChange: (changes: Partial<ServiceFormValues>) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={`${id}-client`}>Cliente</FieldLabel>
      <select
        id={`${id}-client`}
        className="crm-field px-3"
        value={values.clientId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) =>
          onChange({ clientId: event.target.value, projectId: "" })
        }
      >
        <option value="">Elige un cliente</option>
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
    </div>
  );
}

/** Proyectos de la empresa; en el alta, deshabilitado hasta elegir cliente. */
function ProjectField({
  values,
  original,
  disabled,
  onChange,
}: {
  values: ServiceFormValues;
  original?: ServiceFormValues;
  disabled?: boolean;
  onChange: (changes: Partial<ServiceFormValues>) => void;
}) {
  const id = useId();
  const hasClient = Boolean(values.clientId);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        htmlFor={`${id}-project`}
        modified={original && values.projectId !== original.projectId}
      >
        Proyecto
        {!original && (
          <span className="font-medium text-ink-muted"> (opcional)</span>
        )}
      </FieldLabel>
      <select
        id={`${id}-project`}
        className="crm-field px-3"
        value={values.projectId}
        disabled={disabled || !hasClient}
        aria-describedby={original ? undefined : `${id}-hint`}
        onChange={(event) => onChange({ projectId: event.target.value })}
      >
        <option value="">
          {original
            ? "Sin proyecto"
            : "Sin proyecto (servicio general del cliente)"}
        </option>
        {getCompanyProjects(values.clientId).map((project) => (
          <option key={project.id} value={project.id}>
            {project.code} · {project.name}
          </option>
        ))}
      </select>
      {!original && (
        <span id={`${id}-hint`} className="text-compact text-ink-muted">
          {hasClient
            ? "Vincúlalo si el servicio nació de un proyecto, por ejemplo el hosting de una app que entregaste."
            : "Primero elige el cliente."}
        </span>
      )}
    </div>
  );
}
