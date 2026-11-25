import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";

/**
 * `<title>` propio: un `not-found` de segmento no admite `metadata`, y el 404
 * que se sirve desde la caché no conserva el de `generateMetadata`.
 */
export default function TicketNotFound() {
  return (
    <div className="crm-content">
      <title>Ticket no encontrado — CRM TI</title>
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Tickets", href: "/tickets" },
            { label: "Ticket no encontrado" },
          ]}
        />
        <h1 className="crm-title">Ticket no encontrado</h1>
        <p className="text-sm text-ink-muted">
          Este ticket no existe o fue eliminado.
        </p>
      </div>
      <Link href="/tickets" className="crm-btn crm-btn-secondary self-start">
        Volver a tickets
      </Link>
    </div>
  );
}
