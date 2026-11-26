"use client";

import { useId } from "react";
import { FieldLabel } from "@/components/form-field";
import { LockIcon } from "@/components/icons";
import { looksLikeSecret } from "@/features/services/utils";

/** El aviso de contraseña no impide guardar. */
export function ServiceNotesField({
  notes,
  onChange,
  original,
  disabled,
}: {
  notes: string;
  onChange: (notes: string) => void;
  /** Notas guardadas. Solo en la edición: marca el cambio. */
  original?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const isEdit = original !== undefined;

  return (
    <section aria-labelledby={`${id}-label`} className="crm-card gap-2.5">
      <FieldLabel
        id={`${id}-label`}
        htmlFor={`${id}-notes`}
        className="crm-heading"
        modified={isEdit && notes !== original}
        modifiedText="modificadas"
      >
        Notas
        {!isEdit && (
          <span className="text-sm font-medium text-ink-muted">
            {" "}
            (opcional)
          </span>
        )}
      </FieldLabel>
      <textarea
        id={`${id}-notes`}
        rows={3}
        className="crm-textarea"
        placeholder="Qué incluye, cuenta del proveedor, dónde está la factura…"
        value={notes}
        disabled={disabled}
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(event.target.value)}
      />
      <span
        id={`${id}-hint`}
        className="flex items-start gap-2 text-compact leading-[1.45] text-ink-muted"
      >
        <LockIcon className="mt-0.5 flex-none" />
        No guardes contraseñas aquí: anota en qué gestor están (por ejemplo,
        «Bitwarden › Viña › DigitalOcean»).
      </span>
      {looksLikeSecret(notes) && (
        <span role="alert" className="text-compact font-bold text-danger">
          Parece que escribiste una contraseña o token. Mejor guárdalo en tu
          gestor de contraseñas.
        </span>
      )}
    </section>
  );
}
