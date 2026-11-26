import type { Service } from "@/features/services/types/service";

// Valores comunes de los servicios de ejemplo sin más datos.
const DEFAULTS = {
  noticeDays: 7,
  notes: "",
  createdDaysAgo: 120,
  endInDays: null,
  cancelReason: "",
  charges: [],
} satisfies Partial<Service>;

// Datos de ejemplo, ficticios: se retiran al conectar la base.
export const services: Service[] = [
  {
    ...DEFAULTS,
    id: "9553dd05-8ca2-46ab-9ada-e26a71fce511",
    name: "Plan de mantención web · 8 h/mes",
    type: "Mantención",
    provider: "Tú",
    clientId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    projectId: "c24bedb6-6553-404e-a594-734b5dae8240", // PRJ-019
    period: "mes",
    charge: 120000,
    cost: 0,
    renewInDays: 6,
    autoRenew: false,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "e1aaa587-4a53-4811-aee9-73bee588fae4",
    name: "VPS 4 GB para el sitio",
    type: "Hosting e infraestructura",
    provider: "DigitalOcean",
    clientId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    projectId: "c24bedb6-6553-404e-a594-734b5dae8240", // PRJ-019
    period: "mes",
    charge: 25000,
    cost: 22000,
    renewInDays: 6,
    autoRenew: true,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "68a4ab37-5e1c-4dd3-ae57-dae693f3aca4",
    name: "Dominio quillayes.example",
    type: "Dominios y SSL",
    provider: "NIC Chile",
    clientId: "2ae4d061-9868-449b-9758-6dd5570deefd", // Benjamín Araya
    projectId: "c24bedb6-6553-404e-a594-734b5dae8240", // PRJ-019
    period: "año",
    charge: 15000,
    cost: 9950,
    renewInDays: 27,
    autoRenew: false,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "47a2f1eb-d562-40ca-a6a4-cf6bca5d937f",
    name: "Hosting del portal de clientes",
    type: "Hosting e infraestructura",
    provider: "Vercel Pro",
    clientId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    projectId: "6ad6841d-375e-4944-9549-6ad296e07c47", // PRJ-021
    period: "mes",
    charge: 35000,
    cost: 19000,
    renewInDays: 12,
    autoRenew: true,
    status: "Activo",
    createdDaysAgo: 210,
    charges: [
      { monthsAgo: 0, amount: 35000, cost: 19000, paidDay: null },
      { monthsAgo: 1, amount: 35000, cost: 19000, paidDay: 3 },
      { monthsAgo: 2, amount: 35000, cost: 19000, paidDay: 5 },
      { monthsAgo: 3, amount: 30000, cost: 19000, paidDay: 2 },
    ],
  },
  {
    ...DEFAULTS,
    id: "2b0707dd-40b8-4143-8ec9-7349cc2e66fd",
    name: "Base de datos del portal",
    type: "Hosting e infraestructura",
    provider: "Supabase Pro",
    clientId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    projectId: "6ad6841d-375e-4944-9549-6ad296e07c47", // PRJ-021
    period: "mes",
    charge: 30000,
    cost: 24000,
    renewInDays: 12,
    autoRenew: true,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "93224bc5-d03d-4a10-a49e-9c9fc5bea6ad",
    name: "SSL comodín *.andeslogistica.example",
    type: "Dominios y SSL",
    provider: "Sectigo",
    clientId: "e34fc432-82e9-4cb2-b4a0-88d28dc6bd37", // Andrea Valdés
    projectId: null,
    period: "año",
    charge: 60000,
    cost: 45000,
    renewInDays: 9,
    autoRenew: false,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "fb89e583-194d-4920-8d7d-d808199d5932",
    name: "Soporte evolutivo app de agenda · bolsa 20 h",
    type: "Mantención",
    provider: "Tú",
    clientId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    projectId: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1", // PRJ-018
    period: "mes",
    charge: 450000,
    cost: 0,
    renewInDays: 3,
    autoRenew: false,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "3d54da5d-b790-4f85-a3cf-d23e111fa632",
    name: "API de WhatsApp para recordatorios",
    type: "Licencias y APIs",
    provider: "Twilio",
    clientId: "a01345c9-7f2a-4bd8-bc37-249651dbed01", // Javiera Contreras
    projectId: "2791c84e-2ca7-41f0-b7dc-fbb1737902d1", // PRJ-018
    period: "mes",
    charge: 40000,
    cost: 32000,
    renewInDays: 18,
    autoRenew: true,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "698e7acd-694a-490f-8910-7f10c773a0bf",
    name: "Correo transaccional",
    type: "Licencias y APIs",
    provider: "Resend · plan gratuito",
    clientId: "14a813af-e7d7-40c3-b696-a10b9331f60e", // Catalina Morales
    projectId: "a0464a9a-8073-4861-a8ef-aba05f2fb3a0", // PRJ-022
    period: "mes",
    charge: 12000,
    cost: 0,
    renewInDays: 40,
    autoRenew: true,
    status: "Activo",
  },
  {
    ...DEFAULTS,
    id: "88538e0f-340c-4e09-a8c9-1790582088b9",
    name: "Mantención de la tienda online",
    type: "Mantención",
    provider: "Tú",
    clientId: "02025f6f-1539-4c3f-a940-e3fd95224324", // Paula Navarro
    projectId: "c24c5afd-61f1-4cc7-a46d-08aaaff677a2", // PRJ-015
    period: "mes",
    charge: 80000,
    cost: 0,
    renewInDays: 45,
    autoRenew: false,
    status: "En pausa",
  },
  {
    ...DEFAULTS,
    id: "b72a6c90-909c-4a01-8d0c-95d60b0743de",
    name: "Hosting compartido antiguo",
    type: "Hosting e infraestructura",
    provider: "Hostinger",
    clientId: "39e45a1b-467a-480c-851a-0e4b05222ce9", // Ignacio Sepúlveda
    projectId: null,
    period: "mes",
    charge: 15000,
    cost: 8000,
    renewInDays: -30,
    autoRenew: false,
    status: "Cancelado",
    endInDays: -30,
    cancelReason: "El cliente migró a su propio servidor",
  },
];
