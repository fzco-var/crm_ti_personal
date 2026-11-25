import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { tickets } from "@/data/tickets";
import { findTicketById } from "@/features/tickets/utils";

export function generateStaticParams() {
  return tickets.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tickets/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findTicketById(id) ? "Editar ticket" : "Ticket no encontrado",
  };
}

export default async function EditTicketPage({
  params,
}: PageProps<"/tickets/[id]">) {
  const { id } = await params;
  const ticket = findTicketById(id);
  if (!ticket) notFound();

  // Paso 14 del SPEC 04: el formulario de edición llega en el paso 16.
  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Tickets", href: "/tickets" },
            { label: ticket.code },
          ]}
        />
        <h1 className="crm-title">{ticket.title}</h1>
      </div>
    </div>
  );
}
