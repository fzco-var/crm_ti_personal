"use client";

import { useId, useState } from "react";
import { canDeleteRole } from "@/features/roles/utils";

function getDeleteText(system: boolean, userCount: number) {
  if (system) return "Es un rol del sistema y no se puede eliminar.";
  if (userCount > 0) {
    return `Primero reasigna a sus ${userCount} usuarios a otro rol.`;
  }
  return "Nadie lo usa, así que puedes eliminarlo sin afectar a nadie.";
}

/** Eliminar pide confirmación en el mismo sitio: dos pulsaciones. */
export function RoleDangerZone({
  system,
  userCount,
  disabled,
  onDelete,
}: {
  system: boolean;
  userCount: number;
  disabled: boolean;
  onDelete: () => void;
}) {
  const headingId = useId();
  const [confirming, setConfirming] = useState(false);
  const deletable = canDeleteRole({ system }, userCount);

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
          Eliminar rol
        </h2>
        <span className="text-sm leading-[1.45] text-ink-muted">
          {getDeleteText(system, userCount)}
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
          disabled={!deletable || disabled}
          onClick={handleDelete}
        >
          {confirming ? "Sí, eliminar" : "Eliminar rol"}
        </button>
      </div>
    </section>
  );
}
