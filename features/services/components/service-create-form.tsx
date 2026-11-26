"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { useToday } from "@/components/use-today";
import { ServiceDataFields } from "@/features/services/components/service-data-fields";
import { ServiceTypeFields } from "@/features/services/components/service-type-fields";
import type { ServiceFormValues } from "@/features/services/types/service";
import { getNewServiceValues } from "@/features/services/utils";

/**
 * `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás. La
 * renovación por defecto depende de hoy, que solo se conoce en el navegador.
 */
export function ServiceCreateForm() {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando servicio…
        </p>
      </div>
    );
  }
  return <CreateForm key={bfcacheId} today={today} />;
}

// Cobro, renovación, notas, vista previa y guardado llegan en los pasos 10 a 12.
function CreateForm({ today }: { today: string }) {
  const [values, setValues] = useState<ServiceFormValues>(() =>
    getNewServiceValues(today),
  );

  function change(changes: Partial<ServiceFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  return (
    <form className="crm-content" noValidate>
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Servicios", href: "/services" },
            { label: "Nuevo servicio" },
          ]}
        />
        <h1 className="crm-title">Nuevo servicio</h1>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ServiceTypeFields values={values} onChange={change} />
          <ServiceDataFields values={values} errors={{}} onChange={change} />
        </div>
      </div>
    </form>
  );
}
