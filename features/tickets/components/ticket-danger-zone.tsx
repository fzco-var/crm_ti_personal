"use client";

import { useId, useState } from "react";

/** Eliminar pide confirmación en el mismo sitio: dos pulsaciones. */
export function TicketDangerZone({
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
          Eliminar ticket
        </h2>
        <span aria-live="polite" className="text-sm text-ink-muted">
          {confirming
            ? "¿Seguro? Se borran también sus notas. Si ya se resolvió, mejor ciérralo."
            : "Solo si se creó por error o está duplicado."}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {confirming && (
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
