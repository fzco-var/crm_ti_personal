import type { Metadata } from "next";
import { services } from "@/data/services";
import { ServicesList } from "@/features/services/components/services-list";

export const metadata: Metadata = { title: "Servicios" };

export default function ServicesPage() {
  return <ServicesList services={services} />;
}
