"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import type { ClientFormValues } from "@/features/clients/types/client";

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>;

export interface ClientFieldsProps {
  values: ClientFormValues;
  errors: ClientFormErrors;
  onChange: (changes: Partial<ClientFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ClientFormValues & { id: string };
}

export function FieldLabel({
  modified,
  children,
  ...props
}: ComponentProps<"label"> & { modified?: boolean }) {
  return (
    <label className="crm-label" {...props}>
      {children}
      {modified && (
        <span className="text-xs font-bold text-accent"> · modificado</span>
      )}
    </label>
  );
}

export function FieldError({
  id,
  children,
}: {
  id: string;
  children?: string;
}) {
  if (!children) return null;
  return (
    <span id={id} className="crm-field-error">
      {children}
    </span>
  );
}

/** Los `id` salen de `useId`: Activity deja ocultas en el DOM otras pantallas. */
export function TextField({
  label,
  error,
  modified,
  children,
  ...inputProps
}: Omit<ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  modified?: boolean;
  /** Ayuda debajo del campo. */
  children?: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} modified={modified}>
        {label}
      </FieldLabel>
      <input
        type="text"
        autoComplete="off"
        className="crm-field"
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
