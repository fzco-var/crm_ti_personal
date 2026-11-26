import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { ServiceEditForm } from "@/features/services/components/service-edit-form";
import { findServiceById } from "@/features/services/utils";

export function generateStaticParams() {
  return services.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findServiceById(id) ? "Editar servicio" : "Servicio no encontrado",
  };
}

export default async function EditServicePage({
  params,
}: PageProps<"/services/[id]">) {
  const { id } = await params;
  const service = findServiceById(id);
  if (!service) notFound();

  return <ServiceEditForm service={service} />;
}
