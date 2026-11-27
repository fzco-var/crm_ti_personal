import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";

/**
 * `<title>` propio: un `not-found` de segmento no admite `metadata`, y el 404
 * que se sirve desde la caché no conserva el de `generateMetadata`.
 */
export default function RoleNotFound() {
  return (
    <div className="crm-content">
      <title>Rol no encontrado — CRM TI</title>
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Configuración" },
            { label: "Roles y permisos", href: "/roles" },
            { label: "Rol no encontrado" },
          ]}
        />
        <h1 className="crm-title">Rol no encontrado</h1>
        <p className="text-sm text-ink-muted">
          Este rol no existe o fue eliminado.
        </p>
      </div>
      <Link href="/roles" className="crm-btn crm-btn-secondary self-start">
        Volver a roles
      </Link>
    </div>
  );
}
