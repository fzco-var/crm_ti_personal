export type ClientRole =
  "Decisor" | "Contacto técnico" | "Facturación" | "Usuario final";

export type TicketStatus = "Abierto" | "En curso" | "Cerrado";

// Valores editables; el formulario de alta admite `role` vacío.
export interface ClientFormValues {
  firstName: string;
  lastName: string;
  company: string;
  phonePrefix: string; // "+56"
  phone: string; // solo dígitos en los datos: "955550101"
  email: string;
  street: string;
  unit: string; // depto., oficina o piso; puede ser ""
  city: string; // comuna o ciudad
  region: string;
  role: ClientRole | "";
  notes: string;
}

export interface Client extends ClientFormValues {
  id: string; // UUID
  role: ClientRole;
  since?: string; // "mar 2025"
  tickets: { id: string; title: string; status: TicketStatus }[];
  history: string[];
}
