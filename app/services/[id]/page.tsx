import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
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

// La edición se conecta en el paso 14 del SPEC 06.
export default async function EditServicePage({
  params,
}: PageProps<"/services/[id]">) {
  const { id } = await params;
  const service = findServiceById(id);
  if (!service) notFound();

  return (
    <div className="crm-content">
      <h1 className="crm-title">{service.name}</h1>
    </div>
  );
}
