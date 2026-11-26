"use client";

import { useId, useState } from "react";

/** Eliminar pide confirmación en el mismo sitio: dos pulsaciones. */
export function ServiceDangerZone({
  disabled,
  onDelete,
}: {
  disabled: boolean;
  onDelete: () => void;
}) {
  const headingId = useId();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    setConfirming(!confirming);
    if (confirming) onDelete();
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-tone-red-line bg-surface px-7 py-5"
    >
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
        <h2 id={headingId} className="text-base font-bold text-tone-red-fg">
          Eliminar servicio
        </h2>
        <span
          aria-live="polite"
          className="text-sm leading-[1.45] text-ink-muted"
        >
          {confirming
            ? "¿Seguro? Se borra también el historial de cobros. Si ya no lo prestas, mejor márcalo como cancelado."
            : "Solo si lo creaste por error. Para dejar de cobrarlo, cancélalo."}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {confirming && !disabled && (
          <button
            type="button"
            className="crm-btn crm-btn-md crm-btn-secondary"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          className="crm-btn crm-btn-md crm-btn-danger-solid"
          disabled={disabled}
          onClick={handleDelete}
        >
          {confirming ? "Sí, eliminar definitivamente" : "Eliminar…"}
        </button>
      </div>
    </section>
  );
}
