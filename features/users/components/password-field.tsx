"use client";

import { useId, useState, type ReactNode } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";
import { EyeIcon, EyeOffIcon, GenerateIcon } from "@/components/icons";
import { PasswordStrength } from "@/features/users/components/password-strength";
import { generatePassword } from "@/features/users/utils";

/**
 * Contraseña con "Generar segura" y barra de fuerza. Con `revealable`, se
 * oculta y el ojo la muestra; sin él, se ve siempre (contraseña temporal).
 * La contraseña solo vive en el estado del formulario.
 */
export function PasswordField({
  label,
  hint,
  value,
  onChange,
  error,
  revealable = false,
  placeholder,
  emptyLabel,
  disabled = false,
  children,
}: {
  label: string;
  /** Texto a la derecha de la etiqueta. */
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  revealable?: boolean;
  placeholder?: string;
  /** Texto de la fuerza con la contraseña vacía. */
  emptyLabel?: string;
  disabled?: boolean;
  /** Contenido debajo del error. */
  children?: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [shown, setShown] = useState(false);
  const visible = !revealable || shown;

  function generate() {
    // Solo en el manejador: `crypto.getRandomValues` no corre al renderizar.
    onChange(generatePassword());
    setShown(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {hint && <span className="text-compact text-ink-muted">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex flex-[1_1_260px]">
          <input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            spellCheck={false}
            className={`crm-field font-mono ${revealable ? "pr-[52px]" : ""}`}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {revealable && (
            <button
              type="button"
              className="crm-icon-btn absolute top-0.5 right-0.5 size-[42px] text-ink-muted"
              aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={disabled}
              onClick={() => setShown(!shown)}
            >
              {shown ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        <button
          type="button"
          className="crm-btn crm-btn-secondary crm-btn-md"
          disabled={disabled}
          onClick={generate}
        >
          <GenerateIcon />
          Generar segura
        </button>
      </div>
      <PasswordStrength password={value} emptyLabel={emptyLabel} />
      <FieldError id={errorId}>{error}</FieldError>
      {children}
    </div>
  );
}
