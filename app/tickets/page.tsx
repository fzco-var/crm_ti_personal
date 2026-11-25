import type { Metadata } from "next";
import { tickets } from "@/data/tickets";
import { TicketsList } from "@/features/tickets/components/tickets-list";

export const metadata: Metadata = { title: "Tickets" };

export default function TicketsPage() {
  return <TicketsList tickets={tickets} />;
}
