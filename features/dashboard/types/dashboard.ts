// Define el icono del aviso y desempata el orden.
export type AttentionKind = "critical" | "money" | "clock";

export type RenewalRange = 7 | 30;

export interface AttentionItem {
  // "project-<uuid>", "ticket-<uuid>", "charge-<uuid>-<monthsAgo>" o "renewal-<uuid>".
  id: string;
  kind: AttentionKind;
  // "PRJ-018 · App de agenda y recordatorios".
  title: string;
  // "Proyecto atrasado · Clínica Austral Sur · 2 tickets abiertos".
  detail: string;
  // "/projects/<uuid>", "/tickets/<uuid>" o "/services/<uuid>".
  href: string;
  // "hace 3 d", "hoy", "mañana", "en 4 d", "este mes" o "sin fecha".
  whenText: string;
  // Los `null` van al final.
  sortDays: number | null;
}
