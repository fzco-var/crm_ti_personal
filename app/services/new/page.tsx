import type { Metadata } from "next";
import { ServiceCreateForm } from "@/features/services/components/service-create-form";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default function NewServicePage() {
  return <ServiceCreateForm />;
}
