import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";

export default function ClientNotFound() {
  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Clientes", href: "/clients" },
            { label: "Cliente no encontrado" },
          ]}
        />
        <h1 className="crm-title">Cliente no encontrado</h1>
        <p className="text-sm text-ink-muted">
          Este cliente no existe o fue eliminado.
        </p>
      </div>
      <Link href="/clients" className="crm-btn crm-btn-secondary self-start">
        Volver a clientes
      </Link>
    </div>
  );
}
