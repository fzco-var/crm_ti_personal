"use client";

import { useId, useState, type ReactNode } from "react";

function getConfirmText(ticketCount: number) {
  const tickets =
    ticketCount === 1
      ? " Su ticket quedará a nombre de «contacto eliminado»."
      : ` Sus ${ticketCount} tickets quedarán a nombre de «contacto eliminado».`;
  return `¿Seguro? Se borra para siempre.${ticketCount > 0 ? tickets : ""}`;
}

export function ClientDangerZone({
  ticketCount,
  archived,
  disabled,
  onToggleArchived,
  onDelete,
}: {
  ticketCount: number;
  archived: boolean;
  disabled: boolean;
  onToggleArchived: () => void;
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
      className="flex flex-col divide-y divide-tone-red-line overflow-hidden rounded-card border border-tone-red-line bg-surface"
    >
      <h2 id={headingId} className="crm-heading px-7 py-5 text-tone-red-fg">
        Zona de peligro
      </h2>
      <DangerRow
        title={archived ? "Restaurar contacto" : "Archivar contacto"}
        text={
          archived
            ? "Está archivado: no aparece en el listado ni en las búsquedas. Restáuralo para volver a verlo."
            : "Lo oculta del listado sin borrar su historial. Útil si ya no trabaja en la empresa."
        }
      >
        <button
          type="button"
          className="crm-btn crm-btn-md crm-btn-danger"
          disabled={disabled}
          onClick={onToggleArchived}
        >
          {archived ? "Restaurar" : "Archivar"}
        </button>
      </DangerRow>
      <DangerRow
        title="Eliminar contacto"
        text={
          confirming
            ? getConfirmText(ticketCount)
            : "Borra el contacto para siempre. Si solo dejó la empresa, mejor archívalo."
        }
      >
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
          key="delete"
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
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-5">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
        <span className="text-field font-bold">{title}</span>
        <span aria-live="polite" className="text-sm text-ink-muted">
          {text}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
