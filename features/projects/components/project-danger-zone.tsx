"use client";

import { useId, useState, type ReactNode } from "react";

function getDeleteWarning(ticketCount: number) {
  const base = "¿Seguro? Se borran sus hitos e historial.";
  if (ticketCount === 0) return base;
  if (ticketCount === 1)
    return `${base} Su ticket queda sin proyecto asignado.`;
  return `${base} Los ${ticketCount} tickets quedan sin proyecto asignado.`;
}

/**
 * Archivar y restaurar solo cambian el estado local. Eliminar pide
 * confirmación en el mismo sitio: dos pulsaciones.
 */
export function ProjectDangerZone({
  archived,
  ticketCount,
  disabled,
  onToggleArchive,
  onDelete,
}: {
  archived: boolean;
  ticketCount: number;
  disabled: boolean;
  onToggleArchive: () => void;
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
      className="flex flex-col overflow-hidden rounded-card border border-tone-red-line bg-surface"
    >
      <h2
        id={headingId}
        className="border-b border-tone-red-line px-7 py-5 text-lg font-bold text-tone-red-fg"
      >
        Zona de peligro
      </h2>
      <DangerRow
        title={archived ? "Restaurar proyecto" : "Archivar proyecto"}
        text={
          archived
            ? "Está archivado: no aparece en el listado. Restáuralo para volver a verlo."
            : "Lo saca del listado sin borrar hitos, tickets ni historial."
        }
        className="border-b border-tone-red-line"
      >
        <button
          type="button"
          className="crm-btn crm-btn-md crm-btn-danger"
          disabled={disabled}
          onClick={onToggleArchive}
        >
          {archived ? "Restaurar" : "Archivar"}
        </button>
      </DangerRow>
      <DangerRow
        title="Eliminar proyecto"
        text={
          confirming
            ? getDeleteWarning(ticketCount)
            : "Bórralo solo si se creó por error. Si terminó, márcalo como completado."
        }
      >
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
      </DangerRow>
    </section>
  );
}

function DangerRow({
  title,
  text,
  className = "",
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 px-7 py-5 ${className}`}
    >
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
        <span className="text-[15px] font-bold">{title}</span>
        <span aria-live="polite" className="text-sm text-ink-muted">
          {text}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
