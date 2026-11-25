import type { Ticket } from "@/features/tickets/types/ticket";

// Datos de ejemplo, ficticios: se retiran al conectar la base.
export const tickets: Ticket[] = [
  {
    id: "eecfa0d6-b08f-43f6-87c1-83828049ce2b",
    code: "#T-1051",
    title: "Definir campos del registro de pacientes",
    type: "Consulta",
    description: "",
    projectId: "aa481683-3cda-4119-b29c-134927d983c2", // PRJ-025
    requesterId: "1bd72b74-c705-4199-9b43-f0f22c15f3cd", // Tomás Riquelme
    status: "Abierto",
    priority: "Media",
    dueInDays: null,
    waitingFor: "",
    activity: [
      {
        author: "Tomás Riquelme",
        initials: "TR",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 1,
        text: "",
      },
    ],
  },
  {
    id: "582e3cf9-b2c8-4f5b-ad8e-59b078e6a6f1",
    code: "#T-1050",
    title: "El buscador de causas no encuentra por RUT con puntos",
    type: "Bug",
    description: "",
    projectId: "a0464a9a-8073-4861-a8ef-aba05f2fb3a0", // PRJ-022
    requesterId: "14a813af-e7d7-40c3-b696-a10b9331f60e", // Catalina Morales
    status: "Abierto",
    priority: "Alta",
    dueInDays: 2,
    waitingFor: "",
    activity: [
      {
        author: "Catalina Morales",
        initials: "CM",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 3,
        text: "",
      },
    ],
  },
  {
    id: "79fbc321-a8f0-41f2-8957-e313eb1aae7d",
    code: "#T-1049",
    title: "Esperando textos legales del consentimiento",
    type: "Consulta",
    description: "",
    projectId: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1", // PRJ-018
    requesterId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    status: "En espera",
    priority: "Media",
    dueInDays: null,
    waitingFor: "",
    activity: [
      {
        author: "Javiera Contreras",
        initials: "JC",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 20,
        text: "",
      },
    ],
  },
  {
    id: "bde74cd3-630d-4af1-883b-da0bdda4f4d8",
    code: "#T-1048",
    title: "El botón «Descargar factura» devuelve error 500",
    type: "Bug",
    description:
      "Desde el último deploy, al hacer clic en «Descargar factura» en el portal aparece un error 500. Pasa con las facturas de septiembre en adelante.",
    projectId: "6ad6841d-375e-4944-9549-6ad296e07c47", // PRJ-021
    requesterId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    status: "Abierto",
    priority: "Alta",
    dueInDays: 1,
    waitingFor: "",
    activity: [
      {
        author: "Martín Vidal",
        initials: "MV",
        isOwn: true,
        action: "agregó una nota",
        hoursAgo: 20,
        text: "Revisé los logs en Vercel: falla la consulta al ERP cuando la factura tiene más de 50 líneas. Parece un timeout de su API.",
      },
      {
        author: "Martín Vidal",
        initials: "MV",
        isOwn: true,
        action: "cambió la prioridad de Media a Alta",
        hoursAgo: 24,
        text: "",
      },
      {
        author: "Andrea Valdés",
        initials: "AV",
        isOwn: false,
        action: "abrió el ticket por correo",
        hoursAgo: 26,
        text: "",
      },
    ],
  },
  {
    id: "79c31463-b110-409c-948d-e320bfbbeb15",
    code: "#T-1046",
    title: "Los recordatorios por WhatsApp se envían duplicados",
    type: "Bug",
    description: "",
    projectId: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1", // PRJ-018
    requesterId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    status: "En curso",
    priority: "Urgente",
    dueInDays: 0,
    waitingFor: "",
    activity: [
      {
        author: "Javiera Contreras",
        initials: "JC",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 30,
        text: "",
      },
    ],
  },
  {
    id: "2d2f9e33-be0e-495e-8dda-210a7d06d991",
    code: "#T-1045",
    title: "Exportar a Excel el listado de causas",
    type: "Mejora",
    description: "",
    projectId: "a0464a9a-8073-4861-a8ef-aba05f2fb3a0", // PRJ-022
    requesterId: "14a813af-e7d7-40c3-b696-a10b9331f60e", // Catalina Morales
    status: "En curso",
    priority: "Media",
    dueInDays: 5,
    waitingFor: "",
    activity: [
      {
        author: "Catalina Morales",
        initials: "CM",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 52,
        text: "",
      },
    ],
  },
  {
    id: "e52cef39-0fe0-4d70-92ba-96bd8c8ab306",
    code: "#T-1044",
    title: "Filtro por fecha en el historial de envíos",
    type: "Mejora",
    description: "",
    projectId: "6ad6841d-375e-4944-9549-6ad296e07c47", // PRJ-021
    requesterId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    status: "En curso",
    priority: "Baja",
    dueInDays: null,
    waitingFor: "",
    activity: [
      {
        author: "Andrea Valdés",
        initials: "AV",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 75,
        text: "",
      },
    ],
  },
  {
    id: "9d62382b-4f1a-4f25-be52-c5ef5de99a46",
    code: "#T-1042",
    title: "El mapa de rutas no carga sin conexión",
    type: "Bug",
    description: "",
    projectId: "5cea19ed-cf3f-404b-b146-7273478e90d1", // PRJ-024
    requesterId: "4a356e8b-ccec-4148-8855-b0fd06022189", // Rodrigo Paredes
    status: "Abierto",
    priority: "Alta",
    dueInDays: -2,
    waitingFor: "",
    activity: [
      {
        author: "Rodrigo Paredes",
        initials: "RP",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 96,
        text: "",
      },
    ],
  },
  {
    id: "5792c729-38c3-4cb9-ab0b-eeecf468fb55",
    code: "#T-1040",
    title: "Falta aprobación del diseño de la página de tours",
    type: "Cambio",
    description: "",
    projectId: "c24bedb6-6553-404e-a594-734b5dae8240", // PRJ-019
    requesterId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    status: "En espera",
    priority: "Media",
    dueInDays: 10,
    waitingFor: "",
    activity: [
      {
        author: "Benjamín Araya",
        initials: "BA",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 140,
        text: "",
      },
    ],
  },
  {
    id: "f01408ed-8f54-41e5-ba42-184a7512b8b1",
    code: "#T-1037",
    title: "Configurar dominio y SSL del portal",
    type: "Cambio",
    description: "",
    projectId: "6ad6841d-375e-4944-9549-6ad296e07c47", // PRJ-021
    requesterId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    status: "Cerrado",
    priority: "Media",
    dueInDays: -5,
    waitingFor: "",
    activity: [
      {
        author: "Andrea Valdés",
        initials: "AV",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 200,
        text: "",
      },
    ],
  },
  {
    id: "9b4ade4a-d6b5-4932-98e8-ae0c0dd15f86",
    code: "#T-1033",
    title: "Integrar Webpay Plus en el checkout",
    type: "Mejora",
    description: "",
    projectId: "c24c5afd-61f1-4cc7-a46d-08aaaff677a2", // PRJ-015
    requesterId: "02025f6f-1539-4c3f-a940-e3fd95224324", // Paula Navarro
    status: "Cerrado",
    priority: "Alta",
    dueInDays: -12,
    waitingFor: "",
    activity: [
      {
        author: "Paula Navarro",
        initials: "PN",
        isOwn: false,
        action: "abrió el ticket",
        hoursAgo: 420,
        text: "",
      },
    ],
  },
];
