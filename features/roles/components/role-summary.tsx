import {
  PERMISSION_MODULES,
  PERMISSION_TOTAL,
} from "@/features/roles/constants";
import type { PermissionKey } from "@/features/roles/types/role";
import {
  countModulePermissions,
  getModuleSummary,
} from "@/features/roles/utils";

/** Columna lateral del alta: nombre, permisos activos y resumen por módulo. */
export function RoleSummary({
  name,
  permissions,
}: {
  name: string;
  permissions: PermissionKey[];
}) {
  const count = permissions.length;

  return (
    <aside aria-label="Resumen" className="crm-card flex-[1_1_280px] gap-5 p-6">
      <h2 className="text-base font-bold">Resumen</h2>

      <div className="flex items-center gap-2.5">
        <span className="size-2.5 flex-none rounded-full bg-accent" />
        <span className="min-w-0 text-field font-bold break-words">
          {name.trim() || "Rol sin nombre"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-compact text-ink-muted">Permisos activos</span>
          <span className="font-mono text-sm font-medium">
            {count} / {PERMISSION_TOTAL}
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

      <ul className="flex flex-col gap-2.5">
        {PERMISSION_MODULES.map((module) => (
          <li
            key={module.id}
            className="flex justify-between gap-3 text-compact"
          >
            <span className="text-ink-soft">{module.label}</span>
            <span
              className={`font-mono ${
                countModulePermissions(permissions, module.id) === 0
                  ? "text-ink-muted"
                  : "text-ink"
              }`}
            >
              {getModuleSummary(permissions, module.id, "long")}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 border-t border-line-soft pt-4">
        <span className="text-compact text-ink-muted">Usuarios asignados</span>
        <span className="text-sm font-semibold">
          Ninguno todavía. Podrás asignarlo desde Usuarios.
        </span>
      </div>
    </aside>
  );
}
