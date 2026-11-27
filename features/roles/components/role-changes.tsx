import { Alert } from "@/components/alert";
import { PERMISSION_TOTAL } from "@/features/roles/constants";
import type { PermissionKey } from "@/features/roles/types/role";
import {
  getPermissionChanges,
  getPermissionLabel,
} from "@/features/roles/utils";

const MAX_CHANGES = 6;

/** Diferencias de permisos respecto a lo guardado y su impacto en usuarios. */
export function RoleChanges({
  savedPermissions,
  permissions,
  userCount,
}: {
  savedPermissions: PermissionKey[];
  permissions: PermissionKey[];
  userCount: number;
}) {
  const { added, removed } = getPermissionChanges(
    savedPermissions,
    permissions,
  );
  const changes = [
    ...added.map((key) => ({ key, added: true })),
    ...removed.map((key) => ({ key, added: false })),
  ];
  const count = permissions.length;

  return (
    <section aria-label="Cambios en permisos" className="crm-card gap-3.5 p-6">
      <h2 className="text-base font-bold">Cambios en permisos</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-compact text-ink-muted">Permisos activos</span>
          <span className="font-mono text-sm font-medium">
            {savedPermissions.length} → {count} / {PERMISSION_TOTAL}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="flex h-1.5 overflow-hidden rounded-[3px] bg-line-soft"
        >
          <span
            className="h-full rounded-[3px] bg-ink"
            style={{
              width: `${Math.round((count / PERMISSION_TOTAL) * 100)}%`,
            }}
          />
        </span>
      </div>

      {changes.length === 0 ? (
        <span className="text-compact text-ink-muted">
          Sin cambios todavía.
        </span>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {changes.slice(0, MAX_CHANGES).map(({ key, added }) => (
            <li key={key} className="flex items-center gap-2 text-compact">
              <span
                aria-hidden="true"
                className={`flex size-5 flex-none items-center justify-center rounded-md font-mono text-compact font-bold ${
                  added
                    ? "bg-tone-green-bg text-tone-green-dot"
                    : "bg-tone-red-bg text-tone-red-dot"
                }`}
              >
                {added ? "+" : "−"}
              </span>
              <span className="sr-only">{added ? "Añadido:" : "Quitado:"}</span>
              <span className="text-ink-soft">{getPermissionLabel(key)}</span>
            </li>
          ))}
        </ul>
      )}
      {changes.length > MAX_CHANGES && (
        <span className="text-compact text-ink-muted">
          y {changes.length - MAX_CHANGES} más
        </span>
      )}

      {changes.length > 0 && userCount > 0 && (
        <Alert variant="warning">
          Afecta a {userCount === 1 ? "1 usuario" : `${userCount} usuarios`}.
          Los cambios se aplican en su siguiente acción, sin cerrar sesión.
        </Alert>
      )}
    </section>
  );
}
