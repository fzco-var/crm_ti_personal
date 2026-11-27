import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = { title: "Ajustes" };

export default function SettingsPage() {
  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[{ label: "Configuración" }, { label: "Ajustes" }]}
        />
        <h1 className="crm-title">Ajustes</h1>
        <p className="text-sm text-ink-muted">
          Preferencias del CRM. La apariencia se guarda en este navegador.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
