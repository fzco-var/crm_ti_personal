import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = { title: "Proyectos" };

// El listado se conecta en el paso 7 del SPEC 05.
export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb items={[{ label: "Operación" }, { label: "Proyectos" }]} />
      <h1 className="crm-title">Proyectos</h1>
    </div>
  );
}
