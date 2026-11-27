"use client";

import { useId, useState } from "react";

/**
 * Desactivar actúa al instante. Eliminar pide escribir el usuario guardado.
 * En la cuenta propia, ninguna de las dos se permite.
 */
export function UserDangerZone({
  active,
  username,
  isCurrentUser,
  disabled,
  onToggleActive,
  onDelete,
}: {
  active: boolean;
  username: string;
  isCurrentUser: boolean;
  /** Tras eliminar, todo queda bloqueado. */
  disabled: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const id = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const locked = isCurrentUser || disabled;

  function toggleConfirm() {
    setConfirmOpen(!confirmOpen);
    setConfirmation("");
  }

  function handleDelete() {
    setConfirmOpen(false);
    setConfirmation("");
    onDelete();
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex flex-col overflow-hidden rounded-card border border-tone-red-line bg-surface"
    >
      <h2
        id={`${id}-heading`}
        className="border-b border-tone-red-line px-7 py-5 text-lg font-bold text-tone-red-fg"
      >
        Zona de peligro
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tone-red-line px-7 py-5">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
          <span className="text-field font-bold">
            {active ? "Desactivar cuenta" : "Reactivar cuenta"}
          </span>
          <span className="text-sm text-ink-muted">
            {active
              ? "No podrá iniciar sesión, pero se conservan sus datos. Puedes reactivarla cuando quieras."
              : "La cuenta está desactivada. Al reactivarla podrá volver a iniciar sesión."}
          </span>
        </div>
        <button
          type="button"
          className="crm-btn crm-btn-danger h-10 px-4 text-compact"
          disabled={locked}
          onClick={onToggleActive}
        >
          {active ? "Desactivar" : "Reactivar"}
        </button>
      </div>
      <div className="flex flex-col gap-3.5 px-7 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
            <span className="text-field font-bold">Eliminar usuario</span>
            <span className="text-sm text-ink-muted">
              Borra la cuenta para siempre. Sus tickets y notas quedan, a nombre
              de «usuario eliminado».
            </span>
          </div>
          <button
            type="button"
            className="crm-btn crm-btn-danger-solid h-10 px-4 text-compact"
            aria-expanded={confirmOpen}
            disabled={locked}
            onClick={toggleConfirm}
          >
            Eliminar…
          </button>
        </div>
        {confirmOpen && !locked && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-tone-red-line bg-tone-red-bg p-4">
            <label
              htmlFor={`${id}-confirm`}
              className="text-sm text-tone-red-fg"
            >
              Para confirmar, escribe{" "}
              <strong className="font-mono">{username}</strong>
            </label>
            <div className="flex flex-wrap gap-2.5">
              <input
                id={`${id}-confirm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                className="crm-field crm-field-sm flex-[1_1_220px] border-danger-line font-mono"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <button
                type="button"
                className="crm-btn crm-btn-danger-solid"
                disabled={confirmation !== username}
                onClick={handleDelete}
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
