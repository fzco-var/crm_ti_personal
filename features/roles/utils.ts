import { roles } from "@/data/roles";
import { users } from "@/data/users";
import {
  ADMIN_ROLE_KEY,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  PERMISSION_PRESETS,
  ROLE_TONES,
} from "@/features/roles/constants";
import type {
  PermissionAction,
  PermissionKey,
  PermissionModule,
  Role,
  RoleFormValues,
} from "@/features/roles/types/role";
import { normalizeText } from "@/lib/text";

// Roles

export function findRoleById(id: string) {
  return roles.find((role) => role.id === id);
}

export function getRoleTone({ key }: Pick<Role, "key">) {
  return ROLE_TONES[key] ?? "gray";
}

/** "Técnico", o "" si el rol no existe. */
export function getRoleName(roleId: string) {
  return findRoleById(roleId)?.name ?? "";
}

export function isAdminRole({ key }: Pick<Role, "key">) {
  return key === ADMIN_ROLE_KEY;
}

/** Usuarios de `data/users.ts` con ese rol, en su orden, activos o no. */
export function getRoleUsers(roleId: string) {
  return users.filter((user) => user.roleId === roleId);
}

/** Ni del sistema ni con usuarios. */
export function canDeleteRole(role: Pick<Role, "system">, userCount: number) {
  return !role.system && userCount === 0;
}

// Listado

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "4 roles · 2 del sistema, 2 personalizados". */
export function getRolesSummaryText(list: Pick<Role, "system">[]) {
  const system = list.filter((role) => role.system).length;
  const custom = list.length - system;
  return `${pluralize(list.length, "rol", "roles")} · ${system} del sistema, ${pluralize(
    custom,
    "personalizado",
    "personalizados",
  )}`;
}

/** Nombre y clave, sin mayúsculas ni tildes. */
export function matchesRoleSearch(
  role: Pick<Role, "name" | "key">,
  query: string,
) {
  const text = normalizeText(query);
  if (!text) return true;
  return normalizeText(`${role.name} ${role.key}`).includes(text);
}

// Permisos

export function toPermissionKey(
  module: PermissionModule,
  action: PermissionAction,
): PermissionKey {
  return `${module}.${action}`;
}

/** Las 30 claves en el orden de la matriz. */
export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_MODULES.flatMap(
  (module) =>
    PERMISSION_ACTIONS.map((action) => toPermissionKey(module.id, action.id)),
);

/** Sin repetidos y en el orden de la matriz. */
export function sortPermissions(permissions: Iterable<PermissionKey>) {
  const set = new Set(permissions);
  return ALL_PERMISSIONS.filter((key) => set.has(key));
}

export function countModulePermissions(
  permissions: PermissionKey[],
  module: PermissionModule,
) {
  return permissions.filter((key) => key.startsWith(`${module}.`)).length;
}

/** "sin acceso", "total", y "3/5" en el listado o "3 de 5" en el alta. */
export function getModuleSummary(
  permissions: PermissionKey[],
  module: PermissionModule,
  format: "short" | "long",
) {
  const count = countModulePermissions(permissions, module);
  const total = PERMISSION_ACTIONS.length;
  if (count === 0) return "sin acceso";
  if (count === total) return "total";
  return format === "short" ? `${count}/${total}` : `${count} de ${total}`;
}

/**
 * Marcar una acción marca "Ver" en su módulo; quitar "Ver" quita todo el
 * módulo.
 */
export function togglePermission(
  permissions: PermissionKey[],
  key: PermissionKey,
) {
  const [module, action] = key.split(".") as [
    PermissionModule,
    PermissionAction,
  ];
  if (!permissions.includes(key)) {
    return sortPermissions([
      ...permissions,
      key,
      toPermissionKey(module, "ver"),
    ]);
  }
  if (action === "ver") {
    return permissions.filter((item) => !item.startsWith(`${module}.`));
  }
  return permissions.filter((item) => item !== key);
}

/** "Todo": marca las 5 acciones del módulo, o las quita si ya estaban todas. */
export function toggleModulePermissions(
  permissions: PermissionKey[],
  module: PermissionModule,
) {
  const rest = permissions.filter((item) => !item.startsWith(`${module}.`));
  if (
    countModulePermissions(permissions, module) === PERMISSION_ACTIONS.length
  ) {
    return rest;
  }
  return sortPermissions([
    ...rest,
    ...PERMISSION_ACTIONS.map((action) => toPermissionKey(module, action.id)),
  ]);
}

export function getPresetPermissions(presetId: string) {
  return (
    PERMISSION_PRESETS.find((preset) => preset.id === presetId)?.permissions ??
    []
  );
}

const CRITICAL_PERMISSIONS: PermissionKey[] = [
  "usuarios.editar",
  "usuarios.eliminar",
];

export function hasCriticalPermission(permissions: PermissionKey[]) {
  return permissions.some((key) => CRITICAL_PERMISSIONS.includes(key));
}

/** "Editar en Clientes". */
export function getPermissionLabel(key: PermissionKey) {
  const [module, action] = key.split(".");
  const moduleLabel = PERMISSION_MODULES.find((m) => m.id === module)?.label;
  const actionLabel = PERMISSION_ACTIONS.find((a) => a.id === action)?.label;
  return `${actionLabel} en ${moduleLabel}`;
}

/** Añadidos y quitados respecto a `saved`, en el orden de la matriz. */
export function getPermissionChanges(
  saved: PermissionKey[],
  current: PermissionKey[],
) {
  return {
    added: sortPermissions(current.filter((key) => !saved.includes(key))),
    removed: sortPermissions(saved.filter((key) => !current.includes(key))),
  };
}

// Clave

/** "Técnico de soporte" → "tecnico_de_soporte"; "" si no hay letras ni dígitos. */
export function generateRoleKey(name: string) {
  return normalizeText(name)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Validación

export type RoleNameError = "empty" | "tooLong" | "taken";
export type RoleKeyError = "empty" | "taken";

export const ROLE_NAME_MAX_LENGTH = 20;

/** Otro rol lo tiene, sin mayúsculas ni tildes; `excludeId` es el propio. */
export function isRoleNameTaken(name: string, excludeId?: string) {
  const text = normalizeText(name);
  return roles.some(
    (role) => role.id !== excludeId && normalizeText(role.name) === text,
  );
}

export function isRoleKeyTaken(key: string) {
  return roles.some((role) => role.key === key);
}

export function getRoleNameError(
  name: string,
  excludeId?: string,
): RoleNameError | undefined {
  const text = name.trim();
  if (!text) return "empty";
  if (text.length > ROLE_NAME_MAX_LENGTH) return "tooLong";
  if (isRoleNameTaken(text, excludeId)) return "taken";
  return undefined;
}

/** Solo en el alta: la edición no cambia la clave. */
export function getRoleKeyError(key: string): RoleKeyError | undefined {
  if (!key) return "empty";
  if (isRoleKeyTaken(key)) return "taken";
  return undefined;
}

/** Campos cambiados respecto a `saved`, para el aviso de cambios sin guardar. */
export function getRoleFormChanges(
  saved: RoleFormValues,
  current: RoleFormValues,
) {
  return {
    name: saved.name !== current.name,
    description: saved.description !== current.description,
    ...getPermissionChanges(saved.permissions, current.permissions),
  };
}
