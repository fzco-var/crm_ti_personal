import type { Project } from "@/features/projects/types/project";

// Datos de ejemplo, ficticios: se retiran al conectar la base.
export const projects: Project[] = [
  {
    id: "3252394c-f5ea-488d-8382-89bbed999b0e",
    code: "PRJ-012",
    name: "Intranet para el estudio",
    clientId: "39e45a1b-467a-480c-851a-0e4b05222ce9", // Ignacio Sepúlveda
    status: "Completado",
    endInDays: -45,
  },
  {
    id: "c24c5afd-61f1-4cc7-a46d-08aaaff677a2",
    code: "PRJ-015",
    name: "Tienda online con Webpay",
    clientId: "02025f6f-1539-4c3f-a940-e3fd95224324", // Paula Navarro
    status: "Completado",
    endInDays: -20,
  },
  {
    id: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1",
    code: "PRJ-018",
    name: "App de agenda y recordatorios",
    clientId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    status: "En curso",
    endInDays: -3,
  },
  {
    id: "c24bedb6-6553-404e-a594-734b5dae8240",
    code: "PRJ-019",
    name: "Sitio web con reservas de tours",
    clientId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    status: "En pausa",
    endInDays: 30,
  },
  {
    id: "6ad6841d-375e-4944-9549-6ad296e07c47",
    code: "PRJ-021",
    name: "Portal de clientes en Next.js",
    clientId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    status: "En curso",
    endInDays: 12,
  },
  {
    id: "a0464a9a-8073-4861-a8ef-aba05f2fb3a0",
    code: "PRJ-022",
    name: "Sistema de gestión de causas",
    clientId: "14a813af-e7d7-40c3-b696-a10b9331f60e", // Catalina Morales
    status: "En curso",
    endInDays: 4,
  },
  {
    id: "5cea19ed-cf3f-404b-b146-7273478e90d1",
    code: "PRJ-024",
    name: "App móvil para choferes",
    clientId: "4a356e8b-ccec-4148-8855-b0fd06022189", // Rodrigo Paredes
    status: "Planificado",
    endInDays: 45,
  },
  {
    id: "aa481683-3cda-4119-b29c-134927d983c2",
    code: "PRJ-025",
    name: "Portal de pacientes",
    clientId: "1bd72b74-c705-4199-9b43-f0f22c15f3cd", // Tomás Riquelme
    status: "Planificado",
    endInDays: 60,
  },
];
