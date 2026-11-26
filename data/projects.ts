import type {
  Project,
  ProjectHistoryEntry,
} from "@/features/projects/types/project";

// Historial mínimo de los proyectos de ejemplo sin más actividad.
function createdHistory(createdDaysAgo: number): ProjectHistoryEntry[] {
  return [
    { text: "Proyecto creado por Martín Vidal", daysAgo: createdDaysAgo },
  ];
}

// Datos de ejemplo, ficticios: se retiran al conectar la base.
export const projects: Project[] = [
  {
    id: "3252394c-f5ea-488d-8382-89bbed999b0e",
    code: "PRJ-012",
    name: "Intranet para el estudio",
    clientId: "39e45a1b-467a-480c-851a-0e4b05222ce9", // Ignacio Sepúlveda
    description: "",
    status: "Completado",
    priority: "Media",
    startInDays: -120,
    endInDays: -45,
    createdDaysAgo: 130,
    milestones: [],
    history: createdHistory(130),
  },
  {
    id: "c24c5afd-61f1-4cc7-a46d-08aaaff677a2",
    code: "PRJ-015",
    name: "Tienda online con Webpay",
    clientId: "02025f6f-1539-4c3f-a940-e3fd95224324", // Paula Navarro
    description: "",
    status: "Completado",
    priority: "Media",
    startInDays: -90,
    endInDays: -20,
    createdDaysAgo: 100,
    milestones: [],
    history: createdHistory(100),
  },
  {
    id: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1",
    code: "PRJ-018",
    name: "App de agenda y recordatorios",
    clientId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    description: "",
    status: "En curso",
    priority: "Alta",
    startInDays: -60,
    endInDays: -3,
    createdDaysAgo: 70,
    milestones: [],
    history: createdHistory(70),
  },
  {
    id: "c24bedb6-6553-404e-a594-734b5dae8240",
    code: "PRJ-019",
    name: "Sitio web con reservas de tours",
    clientId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    description: "",
    status: "En pausa",
    priority: "Baja",
    startInDays: -40,
    endInDays: 30,
    createdDaysAgo: 50,
    milestones: [],
    history: createdHistory(50),
  },
  {
    id: "6ad6841d-375e-4944-9549-6ad296e07c47",
    code: "PRJ-021",
    name: "Portal de clientes en Next.js",
    clientId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    description:
      "Portal donde los clientes de Andes ven el estado de sus envíos, descargan facturas y abren solicitudes. Next.js + Supabase, desplegado en Vercel.",
    status: "En curso",
    priority: "Alta",
    startInDays: -30,
    endInDays: 12,
    createdDaysAgo: 45,
    milestones: [
      {
        name: "Levantamiento de requisitos y diseño en Figma",
        dueInDays: -24,
        done: true,
      },
      { name: "MVP: login y estado de envíos", dueInDays: -10, done: true },
      {
        name: "Descarga de facturas e integración con el ERP",
        dueInDays: -2,
        done: false,
      },
      {
        name: "Pruebas con usuarios y paso a producción",
        dueInDays: 10,
        done: false,
      },
    ],
    history: [
      { text: "Hito «MVP» completado", daysAgo: 10 },
      {
        text: "Fecha de término movida 1 semana · motivo: la API del ERP del cliente no estaba lista",
        daysAgo: 24,
      },
      { text: "Proyecto creado por Martín Vidal", daysAgo: 45 },
    ],
  },
  {
    id: "a0464a9a-8073-4861-a8ef-aba05f2fb3a0",
    code: "PRJ-022",
    name: "Sistema de gestión de causas",
    clientId: "14a813af-e7d7-40c3-b696-a10b9331f60e", // Catalina Morales
    description: "",
    status: "En curso",
    priority: "Alta",
    startInDays: -50,
    endInDays: 4,
    createdDaysAgo: 60,
    milestones: [],
    history: createdHistory(60),
  },
  {
    id: "5cea19ed-cf3f-404b-b146-7273478e90d1",
    code: "PRJ-024",
    name: "App móvil para choferes",
    clientId: "4a356e8b-ccec-4148-8855-b0fd06022189", // Rodrigo Paredes
    description: "",
    status: "Planificado",
    priority: "Media",
    startInDays: 7,
    endInDays: 45,
    createdDaysAgo: 5,
    milestones: [],
    history: createdHistory(5),
  },
  {
    id: "aa481683-3cda-4119-b29c-134927d983c2",
    code: "PRJ-025",
    name: "Portal de pacientes",
    clientId: "1bd72b74-c705-4199-9b43-f0f22c15f3cd", // Tomás Riquelme
    description: "",
    status: "Planificado",
    priority: "Baja",
    startInDays: 14,
    endInDays: 60,
    createdDaysAgo: 2,
    milestones: [],
    history: createdHistory(2),
  },
];
