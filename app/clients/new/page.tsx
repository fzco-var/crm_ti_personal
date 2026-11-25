import type { Metadata } from "next";
import { ClientCreateForm } from "@/features/clients/components/client-create-form";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function NewClientPage() {
  return <ClientCreateForm />;
}
