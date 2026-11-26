export type ServiceType =
  | "Mantención"
  | "Hosting e infraestructura"
  | "Dominios y SSL"
  | "Licencias y APIs";
export type ServiceStatus = "Activo" | "En pausa" | "Cancelado";
export type ServicePeriod = "mes" | "año";
export type ServiceNoticeDays = 3 | 7 | 15 | 30;

export interface ServiceCharge {
  monthsAgo: number; // 0 es el mes en curso
  amount: number; // CLP cobrado al cliente ese periodo
  cost: number; // CLP pagado al proveedor ese periodo
  paidDay: number | null; // día del mes en que pagó; null es pendiente
}

export interface Service {
  id: string; // UUID
  name: string;
  type: ServiceType;
  provider: string; // "Tú" en Mantención
  clientId: string; // contacto, en data/clients.ts
  projectId: string | null; // proyecto de la misma empresa
  period: ServicePeriod;
  charge: number; // CLP por periodo
  cost: number; // CLP por periodo
  renewInDays: number; // desfase respecto a hoy
  noticeDays: ServiceNoticeDays;
  autoRenew: boolean;
  status: ServiceStatus;
  notes: string; // puede ser ""
  createdDaysAgo: number;
  endInDays: number | null; // último día; solo si está "Cancelado"
  cancelReason: string; // puede ser ""
  charges: ServiceCharge[]; // del más reciente al más antiguo
}

// Valores editables; el alta admite `clientId` vacío.
export interface ServiceFormValues {
  name: string;
  type: ServiceType;
  provider: string;
  clientId: string;
  projectId: string; // "" es "Sin proyecto"
  period: ServicePeriod;
  charge: number; // 0 si está vacío
  cost: number;
  renewDate: string; // "2026-11-26" o ""
  noticeDays: ServiceNoticeDays;
  autoRenew: boolean;
  status: ServiceStatus;
  notes: string;
  endDate: string; // último día al cancelar
  cancelReason: string;
}
