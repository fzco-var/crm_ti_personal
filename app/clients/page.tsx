import type { Metadata } from "next";
import { clients } from "@/data/clients";
import { ClientsList } from "@/features/clients/components/clients-list";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientsPage() {
  return <ClientsList clients={clients} />;
}
