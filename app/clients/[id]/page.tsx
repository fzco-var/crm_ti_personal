import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clients } from "@/data/clients";
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

  return (
    <div className="crm-content">
      <h1 className="crm-title">Editar cliente</h1>
      <p className="text-sm text-ink-muted">
        {client.firstName} {client.lastName} · {client.company}
      </p>
    </div>
  );
}
