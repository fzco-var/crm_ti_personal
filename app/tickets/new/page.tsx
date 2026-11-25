import type { Metadata } from "next";
import { TicketCreateForm } from "@/features/tickets/components/ticket-create-form";

export const metadata: Metadata = { title: "Nuevo ticket" };

export default function NewTicketPage() {
  return <TicketCreateForm />;
}
