"use client";

import { useId } from "react";
import { TONE_CLASSES } from "@/components/tone";
import type { User } from "@/features/users/types/user";
import { formatDaysAgo } from "@/features/users/utils";
import { formatDays } from "@/features/tickets/utils";

/** "203.0.113.24 · activa ahora" o "198.51.100.7 · hace 2 días". */
function getSessionInfo(ip: string, lastSeenDaysAgo: number) {
  const seen =
    lastSeenDaysAgo === 0
      ? "activa ahora"
      : `hace ${formatDays(lastSeenDaysAgo)}`;
  return `${ip} · ${seen}`;
}

/** 2FA, sesiones y actividad. Las acciones son inmediatas: no pasan por "Guardar". */
export function UserSecurity({
  account,
  today,
  disabled,
  onResetTwoFactor,
  onCloseSessions,
}: {
  account: Pick<User, "twoFactorActive" | "sessions" | "activity">;
  today: string;
  disabled: boolean;
  onResetTwoFactor: () => void;
  onCloseSessions: () => void;
}) {
  const headingId = useId();
  const { twoFactorActive, sessions, activity } = account;

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Seguridad
      </h2>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">
            Verificación en dos pasos
          </span>
          <span
            className={`crm-badge ${TONE_CLASSES[twoFactorActive ? "green" : "amber"]}`}
          >
            {twoFactorActive ? "Activa" : "Pendiente"}
          </span>
        </div>
        <span className="text-compact leading-[1.45] text-ink-muted">
          {twoFactorActive
            ? "Usa una app autenticadora (TOTP)."
            : "Deberá configurarla en su próximo inicio de sesión."}
        </span>
        <button
          type="button"
          className="crm-btn crm-btn-sm crm-btn-secondary self-start"
          disabled={!twoFactorActive || disabled}
          onClick={onResetTwoFactor}
        >
          Restablecer 2FA
        </button>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line-soft pt-[18px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Sesiones abiertas</span>
          <span className="font-mono text-compact">{sessions.length}</span>
        </div>
        {sessions.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={`${session.device}-${session.ip}`}
                className="flex flex-col gap-0.5 rounded-control bg-surface-muted px-3 py-2.5"
              >
                <span className="text-compact font-semibold">
                  {session.device}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {getSessionInfo(session.ip, session.lastSeenDaysAgo)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-compact text-ink-muted">
            No hay sesiones abiertas.
          </span>
        )}
        <button
          type="button"
          className="crm-btn crm-btn-sm crm-btn-secondary self-start"
          disabled={sessions.length === 0 || disabled}
          onClick={onCloseSessions}
        >
          Cerrar todas las sesiones
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-line-soft pt-[18px]">
        <span className="text-sm font-semibold">Actividad reciente</span>
        {activity.length > 0 ? (
          <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-compact leading-[1.45] text-ink-soft">
            {activity.map((entry) => (
              <li key={`${entry.text}-${entry.daysAgo}`}>
                {entry.text} · {formatDaysAgo(today, entry.daysAgo)}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-compact text-ink-muted">
            Sin actividad registrada.
          </span>
        )}
      </div>
    </aside>
  );
}
