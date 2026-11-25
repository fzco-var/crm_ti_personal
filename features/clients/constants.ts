import type { Tone } from "@/components/tone";
import type { ClientRole } from "@/features/clients/types/client";

export const PHONE_PREFIXES = [
  { value: "+56", label: "CL +56", digits: 9, placeholder: "9 1234 5678" },
  { value: "+54", label: "AR +54", digits: 10, placeholder: "11 1234 5678" },
  { value: "+51", label: "PE +51", digits: 9, placeholder: "912 345 678" },
  { value: "+57", label: "CO +57", digits: 10, placeholder: "300 123 4567" },
  { value: "+1", label: "US +1", digits: 10, placeholder: "201 555 0123" },
] as const;

export const REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O’Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
] as const;

export const CLIENT_ROLES: {
  value: ClientRole;
  description: string;
  tone: Tone;
}[] = [
  {
    value: "Decisor",
    description: "Aprueba presupuestos y contratos.",
    tone: "orange",
  },
  {
    value: "Contacto técnico",
    description: "Con quien coordinas desarrollo, pruebas y despliegues.",
    tone: "blue",
  },
  {
    value: "Facturación",
    description: "Recibe cotizaciones y facturas.",
    tone: "green",
  },
  {
    value: "Usuario final",
    description: "Usa el software que desarrollaste.",
    tone: "gray",
  },
];
