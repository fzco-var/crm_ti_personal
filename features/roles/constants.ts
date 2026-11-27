import type { Tone } from "@/components/tone";

import type {
  PermissionAction,
  PermissionKey,
  PermissionModule,
} from "./types/role";

export const PERMISSION_MODULES: {
  id: PermissionModule;
  label: string;
  desc: string;
}[] = [
  { id: "clientes", label: "Clientes", desc: "Fichas, contactos y notas" },
  {
    id: "servicios",
    label: "Servicios",
    desc: "Hosting, dominios y mantenciones",
  },
  { id: "tickets", label: "Tickets", desc: "Bugs, mejoras y solicitudes" },
  { id: "proyectos", label: "Proyectos", desc: "Tareas, hitos y entregas" },
  { id: "reportes", label: "Reportes", desc: "Métricas y exportaciones" },
  { id: "usuarios", label: "Usuarios y roles", desc: "Accesos al CRM" },
];

export const PERMISSION_ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: "ver", label: "Ver" },
  { id: "crear", label: "Crear" },
  { id: "editar", label: "Editar" },
  { id: "eliminar", label: "Eliminar" },
  { id: "exportar", label: "Exportar" },
];

// Permisos que existen en el CRM; cada rol tiene una parte.
export const PERMISSION_TOTAL =
  PERMISSION_MODULES.length * PERMISSION_ACTIONS.length;

// Por `Role.key`; un rol sin tono, como una copia, usa `gray`.
export const ROLE_TONES: Record<string, Tone> = {
  administrador: "orange",
  tecnico: "blue",
  solo_lectura: "gray",
  soporte_externo: "purple",
};

export const ADMIN_ROLE_KEY = "administrador";

function grant(
  module: PermissionModule,
  actions: PermissionAction[],
): PermissionKey[] {
  return actions.map((action) => `${module}.${action}` as const);
}

const ALL_ACTIONS = PERMISSION_ACTIONS.map((action) => action.id);

export const PERMISSION_PRESETS: {
  id: string;
  label: string;
  desc: string;
  permissions: PermissionKey[];
}[] = [
  {
    id: "en_blanco",
    label: "En blanco",
    desc: "Sin permisos",
    permissions: [],
  },
  {
    id: "solo_lectura",
    label: "Solo lectura",
    desc: "Ver todo, no cambiar nada",
    permissions: PERMISSION_MODULES.flatMap((m) => grant(m.id, ["ver"])),
  },
  {
    id: "tecnico",
    label: "Técnico",
    desc: "Tickets y servicios",
    permissions: [
      ...grant("clientes", ["ver"]),
      ...grant("servicios", ["ver", "crear", "editar"]),
      ...grant("tickets", ["ver", "crear", "editar", "exportar"]),
      ...grant("proyectos", ["ver", "editar"]),
    ],
  },
  {
    id: "administrador",
    label: "Administrador",
    desc: "Acceso total",
    permissions: PERMISSION_MODULES.flatMap((m) => grant(m.id, ALL_ACTIONS)),
  },
];
