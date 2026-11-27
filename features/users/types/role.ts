export interface Role {
  id: string; // UUID
  key: string; // "administrador", como rol.intern_key
  name: string; // "Administrador"
  description: string;
  permissionCount: number; // de PERMISSION_TOTAL
}
