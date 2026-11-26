import type { Tone } from "@/components/tone";
import type {
  ServiceNoticeDays,
  ServicePeriod,
  ServiceStatus,
  ServiceType,
} from "@/features/services/types/service";

// En el orden de las pestañas del listado y de las opciones del alta.
export const SERVICE_TYPES: {
  value: ServiceType;
  description: string;
  placeholder: string;
}[] = [
  {
    value: "Mantención",
    description: "Soporte, horas mensuales o mejoras continuas que haces tú.",
    placeholder: "Ej. Plan de mantención · 8 h/mes",
  },
  {
    value: "Hosting e infraestructura",
    description: "Servidores, Vercel, bases de datos, almacenamiento.",
    placeholder: "Ej. Hosting de la app en Vercel",
  },
  {
    value: "Dominios y SSL",
    description: "Dominios .cl / .com y certificados.",
    placeholder: "Ej. Dominio empresa.cl",
  },
  {
    value: "Licencias y APIs",
    description: "APIs de pago, correo transaccional, licencias de software.",
    placeholder: "Ej. API de WhatsApp para notificaciones",
  },
];

// Proveedor fijo de las mantenciones.
export const OWN_PROVIDER = "Tú";

// En el orden en que se ordenan en el listado.
export const SERVICE_STATUSES: ServiceStatus[] = [
  "Activo",
  "En pausa",
  "Cancelado",
];

// El alta no permite crear un servicio cancelado.
export const SERVICE_CREATE_STATUSES: ServiceStatus[] = ["Activo", "En pausa"];

export const SERVICE_STATUS_TONES: Record<ServiceStatus, Tone> = {
  Activo: "green",
  "En pausa": "amber",
  Cancelado: "gray",
};

export const SERVICE_PERIODS: { value: ServicePeriod; label: string }[] = [
  { value: "mes", label: "Mensual" },
  { value: "año", label: "Anual" },
];

// Días que suma "Registrar renovación".
export const SERVICE_RENEWAL_DAYS: Record<ServicePeriod, number> = {
  mes: 30,
  año: 365,
};

export const SERVICE_NOTICE_DAYS: ServiceNoticeDays[] = [3, 7, 15, 30];

// "Vence pronto" y "próximas renovaciones", en días desde hoy.
export const RENEWAL_SOON_DAYS = 14;
export const RENEWAL_UPCOMING_DAYS = 30;
// Las próximas renovaciones a esta distancia o menos van en rojo.
export const RENEWAL_URGENT_DAYS = 7;

// Margen bajo: menos de esta fracción del cobro.
export const LOW_MARGIN_RATIO = 0.2;
