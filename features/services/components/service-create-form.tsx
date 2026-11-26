"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { services } from "@/data/services";
import {
  ServiceChargeFields,
  type ServiceChargeErrors,
} from "@/features/services/components/service-charge-fields";
import {
  ServiceDataFields,
  type ServiceDataErrors,
} from "@/features/services/components/service-data-fields";
import { ServiceNotesField } from "@/features/services/components/service-notes-field";
import { ServicePreview } from "@/features/services/components/service-preview";
import {
  ServiceRenewalFields,
  type ServiceRenewalErrors,
} from "@/features/services/components/service-renewal-fields";
import { ServiceTypeFields } from "@/features/services/components/service-type-fields";
import type { ServiceFormValues } from "@/features/services/types/service";
import {
  formatCLP,
  getFormProvider,
  getInvalidCreateFields,
  getMonthlyContribution,
  getMonthlyRevenue,
  getNewServiceValues,
  getServiceCompany,
  isPastRenewal,
} from "@/features/services/utils";

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

type CreateErrors = ServiceDataErrors &
  ServiceChargeErrors &
  ServiceRenewalErrors;

// El ingreso mensual de los servicios de ejemplo, sin los guardados en el alta.
const BASE_REVENUE = getMonthlyRevenue(services);

/**
 * Los campos vacíos se marcan al primer intento; la renovación pasada, al
 * momento.
 */
function getErrors(
  values: ServiceFormValues,
  tried: boolean,
  today: string,
): CreateErrors {
  const errors: CreateErrors = {};
  if (tried && !values.name.trim()) {
    errors.name = "Ponle un nombre al servicio.";
  }
  if (tried && !getFormProvider(values).trim()) {
    errors.provider = "Indica el proveedor.";
  }
  if (tried && !values.clientId) {
    errors.clientId = "Elige a qué cliente se le cobra.";
  }
  if (tried && values.charge <= 0) {
    errors.charge = "Indica cuánto cobras.";
  }
  if (isPastRenewal(values.renewDate, today)) {
    errors.renewDate = "La fecha ya pasó: usa la próxima renovación.";
  } else if (tried && !values.renewDate) {
    errors.renewDate = "Indica la fecha.";
  }
  return errors;
}

function CreateForm({ today }: { today: string }) {
  const [values, setValues] = useState<ServiceFormValues>(() =>
    getNewServiceValues(today),
  );
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState("");
  // Lo que suman al mes los servicios guardados con "Guardar y agregar otro".
  const [addedRevenue, setAddedRevenue] = useState(0);

  const errors = getErrors(values, tried, today);
  const isValid = getInvalidCreateFields(values, today).length === 0;

  function change(changes: Partial<ServiceFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setSavedText("");
  }

  /** Sin persistencia: muestra el aviso y no añade el servicio al listado. */
  function save(addAnother: boolean) {
    if (!isValid) {
      setTried(true);
      setSavedText("");
      return;
    }
    const text = `«${values.name.trim()}» guardado para ${getServiceCompany(values)} · ${formatCLP(values.charge)} / ${values.period}.`;
    setTried(false);
    if (addAnother) {
      setAddedRevenue((current) => current + getMonthlyContribution(values));
      setValues(getNewServiceValues(today, values));
      setSavedText(`${text} Agrega el siguiente del mismo cliente.`);
    } else {
      setSavedText(text);
    }
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save(false);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
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
        <div className="flex flex-wrap gap-2.5">
          <Link href="/services" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button
            type="button"
            className="crm-btn crm-btn-secondary px-4"
            onClick={() => save(true)}
          >
            Guardar y agregar otro
          </button>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Guardar servicio
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/services"
              className="crm-hit font-bold text-tone-green-fg underline"
            >
              Ver listado
            </Link>
          }
        >
          {savedText}
        </Alert>
      )}

      {tried && !isValid && (
        <Alert variant="danger">
          Revisa los campos marcados antes de guardar.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ServiceTypeFields values={values} onChange={change} />
          <ServiceDataFields
            values={values}
            errors={errors}
            onChange={change}
          />
          <ServiceChargeFields
            values={values}
            errors={errors}
            onChange={change}
          />
          <ServiceRenewalFields
            values={values}
            errors={errors}
            today={today}
            onChange={change}
          />
          <ServiceNotesField
            notes={values.notes}
            onChange={(notes) => change({ notes })}
          />
        </div>
        <ServicePreview
          values={values}
          baseRevenue={BASE_REVENUE + addedRevenue}
        />
      </div>
    </form>
  );
}
