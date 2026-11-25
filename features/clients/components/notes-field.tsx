"use client";

import { useId } from "react";
import type { ClientFieldsProps } from "@/features/clients/components/form-field";

export function NotesField({
  values,
  onChange,
  original,
}: Pick<ClientFieldsProps, "values" | "onChange" | "original">) {
  const id = useId();
  const modified = original && values.notes !== original.notes;

  return (
    <section aria-labelledby={`${id}-label`} className="crm-card gap-3">
      <label id={`${id}-label`} htmlFor={id} className="crm-heading">
        Notas
        {!original && (
          <span className="text-sm font-medium text-ink-muted">
            {" "}
            (opcional)
          </span>
        )}
        {modified && (
          <span className="text-xs font-bold text-accent"> · modificado</span>
        )}
      </label>
      <textarea
        id={id}
        rows={3}
        className="crm-textarea"
        placeholder={
          original
            ? undefined
            : "Horario preferido, cómo prefiere que lo contactes, accesos al edificio…"
        }
        value={values.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
      />
    </section>
  );
}
