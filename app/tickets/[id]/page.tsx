import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tickets } from "@/data/tickets";
import { TicketEditForm } from "@/features/tickets/components/ticket-edit-form";
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

  return <TicketEditForm ticket={ticket} />;
}
