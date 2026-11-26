"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { FieldError, FieldLabel } from "@/components/form-field";
import { formatThousands, parseMoney } from "@/features/services/utils";

function countDigits(text: string) {
  return text.replace(/\D/g, "").length;
}

/** Posición tras el dígito número `digits` del texto formateado. */
function getCaretAfterDigits(text: string, digits: number) {
  if (digits === 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text[index]) && ++seen === digits) return index + 1;
  }
  return text.length;
}

/**
 * Monto en CLP: acepta solo dígitos y muestra el separador de miles. El cursor
 * conserva su lugar entre los dígitos aunque el separador cambie de sitio.
 */
export function MoneyField({
  label,
  value,
  suffix,
  error,
  modified,
  disabled,
  onChange,
  children,
}: {
  label: ReactNode;
  value: number;
  /** "CLP / mes" */
  suffix: string;
  error?: string;
  modified?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
  /** Ayuda debajo del campo. */
  children?: ReactNode;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // Dígitos a la izquierda del cursor tras escribir; nulo si no hay que moverlo.
  const caretDigits = useRef<number | null>(null);
  const text = formatThousands(value);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretDigits.current === null) return;
    const position = getCaretAfterDigits(input.value, caretDigits.current);
    input.setSelectionRange(position, position);
    caretDigits.current = null;
  });

  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} modified={modified}>
        {label}
      </FieldLabel>
      <div className="crm-field-group">
        <span
          aria-hidden="true"
          className="flex h-full flex-none items-center border-r border-line bg-surface-muted px-3 font-mono text-sm text-ink-muted"
        >
          $
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          className="font-mono"
          value={text}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            const input = event.target;
            const typed = input.value;
            const digits = countDigits(
              typed.slice(0, input.selectionStart ?? typed.length),
            );
            const amount = parseMoney(typed);
            if (amount === value) {
              // Sin cambio no hay render: React restaura el texto y el cursor
              // se va al final, así que se recoloca en el siguiente cuadro.
              requestAnimationFrame(() => {
                const position = getCaretAfterDigits(input.value, digits);
                input.setSelectionRange(position, position);
              });
              return;
            }
            caretDigits.current = digits;
            onChange(amount);
          }}
        />
        <span className="flex-none px-3 text-compact text-ink-muted">
          {suffix}
        </span>
      </div>
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
