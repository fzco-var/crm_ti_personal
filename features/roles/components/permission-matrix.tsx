"use client";

import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from "@/features/roles/constants";
import type { PermissionKey } from "@/features/roles/types/role";
import {
  countModulePermissions,
  toPermissionKey,
  toggleModulePermissions,
  togglePermission,
} from "@/features/roles/utils";

/**
 * Tabla de módulos × acciones con casillas nativas. Con `savedPermissions`
 * (edición), las casillas cambiadas llevan borde verde o rojo.
 */
export function PermissionMatrix({
  permissions,
  onChange,
  savedPermissions,
  disabled = false,
}: {
  permissions: PermissionKey[];
  onChange: (permissions: PermissionKey[]) => void;
  savedPermissions?: PermissionKey[];
  disabled?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="crm-table min-w-[640px]">
        <thead>
          <tr>
            <th scope="col">Módulo</th>
            <th scope="col" className="w-16 px-2 text-center">
              Todo
            </th>
            {PERMISSION_ACTIONS.map((action) => (
              <th
                key={action.id}
                scope="col"
                className="w-[76px] px-2 text-center"
              >
                {action.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((module) => {
            const all =
              countModulePermissions(permissions, module.id) ===
              PERMISSION_ACTIONS.length;
            return (
              <tr key={module.id}>
                <th scope="row" className="py-3">
                  <span className="flex flex-col gap-0.5">
                    <span className="font-bold text-ink">{module.label}</span>
                    <span className="text-xs text-ink-muted">
                      {module.desc}
                    </span>
                  </span>
                </th>
                <td className="bg-row-hover p-2 text-center">
                  <input
                    type="checkbox"
                    className="crm-checkbox align-middle"
                    aria-label={`Todos los permisos de ${module.label}`}
                    checked={all}
                    disabled={disabled}
                    onChange={() =>
                      onChange(toggleModulePermissions(permissions, module.id))
                    }
                  />
                </td>
                {PERMISSION_ACTIONS.map((action) => {
                  const key = toPermissionKey(module.id, action.id);
                  const checked = permissions.includes(key);
                  const changed =
                    savedPermissions !== undefined &&
                    savedPermissions.includes(key) !== checked;
                  return (
                    <td key={action.id} className="p-1.5 text-center">
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-lg border-2 ${
                          changed
                            ? checked
                              ? "border-tone-green-dot"
                              : "border-tone-red-dot"
                            : "border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="crm-checkbox"
                          aria-label={`${action.label} en ${module.label}`}
                          checked={checked}
                          disabled={disabled}
                          onChange={() =>
                            onChange(togglePermission(permissions, key))
                          }
                        />
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
