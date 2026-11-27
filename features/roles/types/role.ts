export type PermissionModule =
  "clientes" | "servicios" | "tickets" | "proyectos" | "reportes" | "usuarios";
export type PermissionAction =
  "ver" | "crear" | "editar" | "eliminar" | "exportar";
export type PermissionKey = `${PermissionModule}.${PermissionAction}`; // "tickets.editar"

export interface Role {
  id: string; // UUID
  key: string; // "solo_lectura", como rol.intern_key; no cambia al renombrar
  name: string; // "Solo lectura", hasta 20 caracteres
  description: string; // puede ser ""
  system: boolean; // no se puede eliminar ni renombrar
  permissions: PermissionKey[]; // sin repetidos
  createdDaysAgo: number;
  updatedDaysAgo: number; // última modificación, siempre por Martín Vidal
}

// Valores editables del alta y la edición.
export interface RoleFormValues {
  name: string;
  description: string;
  permissions: PermissionKey[];
}
