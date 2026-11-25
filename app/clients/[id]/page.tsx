import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clients } from "@/data/clients";
import { ClientEditForm } from "@/features/clients/components/client-edit-form";
import { findClientById } from "@/features/clients/utils";

export function generateStaticParams() {
  return clients.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/clients/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findClientById(id) ? "Editar cliente" : "Cliente no encontrado",
  };
}

export default async function EditClientPage({
  params,
}: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const client = findClientById(id);
  if (!client) notFound();

  return <ClientEditForm client={client} />;
}
