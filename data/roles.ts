import type { Role } from "@/features/users/types/role";

export const roles: Role[] = [
  {
    id: "28dd3057-0fda-4407-bce7-8f251136b529",
    key: "administrador",
    name: "Administrador",
    description: "Acceso total al CRM, incluida la configuración.",
    permissionCount: 30,
  },
  {
    id: "02b1f04d-a2b8-4934-857f-9883cbae4f00",
    key: "tecnico",
    name: "Técnico",
    description: "Gestiona tickets y servicios; consulta clientes y proyectos.",
    permissionCount: 10,
  },
  {
    id: "2b8c8900-5928-44a3-8647-4c7fb40ad3d0",
    key: "lectura",
    name: "Solo lectura",
    description: "Puede ver todo, pero no cambiar nada.",
    permissionCount: 6,
  },
];
