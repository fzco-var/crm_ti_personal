"use client";

import { useId, type ReactNode } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";

/** Nombre de usuario en minúsculas, con el prefijo "@" solo visual. */
export function UsernameField({
  value,
  onChange,
  error,
  modified,
  disabled = false,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  modified?: boolean;
  disabled?: boolean;
  /** Ayuda debajo del campo. */
  children?: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} modified={modified}>
        Nombre de usuario
      </FieldLabel>
      <div className="crm-field-group">
        <span
          aria-hidden="true"
          className="flex h-full flex-none items-center border-r border-line bg-surface-muted pr-2.5 pl-3.5 font-mono text-sm text-ink-muted"
        >
          @
        </span>
        <input
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className="font-mono text-sm"
          placeholder="crojas"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <FieldError id={errorId}>{error}</FieldError>
      {children}
    </div>
  );
}
