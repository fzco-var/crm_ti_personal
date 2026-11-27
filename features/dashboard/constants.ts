import type {
  AttentionKind,
  RenewalRange,
} from "@/features/dashboard/types/dashboard";

// Avisos visibles en "Necesita tu atención".
export const ATTENTION_LIMIT = 6;

// Umbral de las renovaciones manuales y de los proyectos que terminan pronto.
export const ATTENTION_SOON_DAYS = 7;

// Desempata los avisos con el mismo `sortDays`.
export const ATTENTION_KIND_ORDER: AttentionKind[] = [
  "critical",
  "money",
  "clock",
];

export const RECENT_TICKETS_LIMIT = 5;

// Desde esta fracción del ingreso, la primera empresa muestra el aviso de concentración.
export const CONCENTRATION_RATIO = 0.5;

export const RENEWAL_RANGES: { value: RenewalRange; label: string }[] = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
];

export const DEFAULT_RENEWAL_RANGE: RenewalRange = 30;

export const QUICK_ACTIONS: {
  label: string;
  href: string;
  primary: boolean;
}[] = [
  { label: "Ticket", href: "/tickets/new", primary: true },
  { label: "Proyecto", href: "/projects/new", primary: false },
  { label: "Cliente", href: "/clients/new", primary: false },
  { label: "Servicio", href: "/services/new", primary: false },
];
