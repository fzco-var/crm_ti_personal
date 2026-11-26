import type { Metadata } from "next";

export const metadata: Metadata = { title: "Servicios" };

// El listado se conecta en el paso 8 del SPEC 06.
export default function ServicesPage() {
  return <h1 className="text-3xl font-bold tracking-[-0.02em]">Servicios</h1>;
}
