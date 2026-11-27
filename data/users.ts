import type { User } from "@/features/users/types/user";

// UUID de data/roles.ts; este archivo solo importa tipos.
const ADMIN_ROLE_ID = "28dd3057-0fda-4407-bce7-8f251136b529";
const TECH_ROLE_ID = "02b1f04d-a2b8-4934-857f-9883cbae4f00";
const READ_ROLE_ID = "2b8c8900-5928-44a3-8647-4c7fb40ad3d0";

// Valores comunes de los usuarios de ejemplo sin más datos.
const DEFAULTS = {
  active: true,
  passwordTemporary: false,
  twoFactorActive: true,
  sessions: [
    { device: "Chrome · Windows", ip: "192.0.2.10", lastSeenDaysAgo: 1 },
  ],
  activity: [],
  createdDaysAgo: 120,
  lastAccessDaysAgo: 1,
} satisfies Partial<User>;

export const users: User[] = [
  {
    ...DEFAULTS,
    // CURRENT_USER_ID
    id: "ce85bac2-92e3-40f4-9bbc-adda7d9a93b9",
    firstName: "Martín",
    lastName: "Vidal",
    username: "admin",
    email: "martin.vidal@example.com",
    roleId: ADMIN_ROLE_ID,
    passwordChangedDaysAgo: 12,
  },
  {
    ...DEFAULTS,
    id: "0a93ee51-6728-4e7c-8d4d-bd7b1298f63f",
    firstName: "Camila",
    lastName: "Rojas",
    username: "crojas",
    email: "camila.rojas@example.com",
    roleId: TECH_ROLE_ID,
    passwordChangedDaysAgo: 60,
    sessions: [
      { device: "Chrome · macOS", ip: "203.0.113.24", lastSeenDaysAgo: 0 },
      { device: "Safari · iPhone", ip: "198.51.100.7", lastSeenDaysAgo: 2 },
    ],
    activity: [
      { text: "Inició sesión", daysAgo: 0 },
      { text: "Cerró el ticket #T-1033", daysAgo: 12 },
      { text: "Cambió su contraseña", daysAgo: 60 },
    ],
    createdDaysAgo: 176,
    lastAccessDaysAgo: 0,
  },
  {
    ...DEFAULTS,
    id: "c500d9fc-0d38-44fb-9a0c-085cc1b8b6bf",
    firstName: "Matías",
    lastName: "Fuentes",
    username: "mfuentes",
    email: "matias.fuentes@example.com",
    roleId: TECH_ROLE_ID,
    passwordChangedDaysAgo: 21,
  },
  {
    ...DEFAULTS,
    id: "968944c7-f0c7-449e-b28d-fe4d27f011a9",
    firstName: "Valentina",
    lastName: "Soto",
    username: "vsoto",
    email: "valentina.soto@example.com",
    roleId: READ_ROLE_ID,
    passwordTemporary: true,
    passwordChangedDaysAgo: 3,
    twoFactorActive: false,
    sessions: [],
    createdDaysAgo: 3,
    lastAccessDaysAgo: null,
  },
  {
    ...DEFAULTS,
    id: "1babc173-55c9-40ba-9b7f-b65ed5cacff7",
    firstName: "Diego",
    lastName: "Muñoz",
    username: "dmunoz",
    email: "diego.munoz@example.com",
    roleId: READ_ROLE_ID,
    active: false,
    passwordChangedDaysAgo: 150,
    sessions: [],
    lastAccessDaysAgo: 40,
  },
  {
    ...DEFAULTS,
    id: "1a8e115a-e02e-474b-a25d-23c1c6470666",
    firstName: "Fernanda",
    lastName: "Pérez",
    username: "fperez",
    email: "fernanda.perez@example.com",
    roleId: TECH_ROLE_ID,
    passwordChangedDaysAgo: 30,
  },
];
