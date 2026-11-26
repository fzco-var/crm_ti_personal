"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { FieldLabel } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { TONE_DOT_CLASSES } from "@/components/tone";
import { useToday } from "@/components/use-today";
import {
  ServiceChargeFields,
  type ServiceChargeErrors,
} from "@/features/services/components/service-charge-fields";
import { ServiceCharges } from "@/features/services/components/service-charges";
import {
  ServiceDataFields,
  type ServiceDataErrors,
} from "@/features/services/components/service-data-fields";
import { ServiceNotesField } from "@/features/services/components/service-notes-field";
import { ServiceRenewalFields } from "@/features/services/components/service-renewal-fields";
import { ServiceSidebar } from "@/features/services/components/service-sidebar";
import { ServiceStatusBadge } from "@/features/services/components/service-status-badge";
import {
  SERVICE_STATUSES,
  SERVICE_STATUS_TONES,
} from "@/features/services/constants";
import type {
  Service,
  ServiceCharge,
  ServiceFormValues,
  ServiceStatus,
} from "@/features/services/types/service";
import {
  formatCLP,
  getChargePeriod,
  getInvalidEditFields,
  getServiceCompany,
  getSinceText,
  toMonthly,
  toServiceFormValues,
} from "@/features/services/utils";
import { formatDate } from "@/features/tickets/utils";

type ChangeKey = Exclude<
  keyof ServiceFormValues,
  "type" | "clientId" | "endDate" | "cancelReason"
>;

// En el orden en que se listan los cambios sin guardar. El último día y el
// motivo de la baja no cuentan por sí solos: van con el paso a "Cancelado".
const CHANGE_LABELS: [ChangeKey, string][] = [
  ["name", "nombre"],
  ["provider", "proveedor"],
  ["projectId", "proyecto"],
  ["status", "estado"],
  ["period", "periodicidad"],
  ["charge", "cobro"],
  ["cost", "costo"],
  ["renewDate", "renovación"],
  ["noticeDays", "aviso"],
  ["autoRenew", "renovación automática"],
  ["notes", "notas"],
];

const STATUS_OPTIONS = SERVICE_STATUSES.map((status) => ({
  value: status,
  dotClassName: TONE_DOT_CLASSES[SERVICE_STATUS_TONES[status]],
}));

// Botones rápidos de la plantilla según el estado elegido.
const QUICK_ACTIONS: Record<
  ServiceStatus,
  { label: string; status: ServiceStatus }[]
> = {
  Activo: [
    { label: "Pausar", status: "En pausa" },
    { label: "Cancelar servicio", status: "Cancelado" },
  ],
  "En pausa": [
    { label: "Reactivar", status: "Activo" },
    { label: "Cancelar servicio", status: "Cancelado" },
  ],
  Cancelado: [{ label: "Reactivar", status: "Activo" }],
};

function getChanges(values: ServiceFormValues, original: ServiceFormValues) {
  return CHANGE_LABELS.filter(([key]) => values[key] !== original[key]).map(
    ([key, label]) =>
      key === "status"
        ? `estado (${original.status} → ${values.status})`
        : label,
  );
}

/** Nombre y cobro se marcan al intentar guardar. */
function getErrors(
  values: ServiceFormValues,
  tried: boolean,
): ServiceDataErrors & ServiceChargeErrors {
  const errors: ServiceDataErrors & ServiceChargeErrors = {};
  if (tried && !values.name.trim()) {
    errors.name = "El nombre no puede quedar vacío.";
  }
  if (tried && values.charge <= 0) {
    errors.charge = "El cobro debe ser mayor a 0.";
  }
  return errors;
}

/** Aviso al guardar: cancelación, nuevo cobro o la cantidad de cambios. */
function getSaveNotice(
  values: ServiceFormValues,
  original: ServiceFormValues,
  changeCount: number,
) {
  if (values.status === "Cancelado" && original.status !== "Cancelado") {
    return `Servicio cancelado. No olvides darlo de baja en ${original.provider}.`;
  }
  if (values.charge !== original.charge) {
    const from = values.renewDate
      ? `el ${formatDate(values.renewDate)}`
      : "el próximo periodo";
    return `Nuevo cobro de ${formatCLP(values.charge)} guardado; se aplica desde ${from}.`;
  }
  return `Cambios guardados (${changeCount}).`;
}

/**
 * `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás.
 * Las fechas dependen del día del navegador: sin él, no hay formulario.
 */
export function ServiceEditForm({ service }: { service: Service }) {
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
  return <EditForm key={bfcacheId} service={service} today={today} />;
}

function EditForm({ service, today }: { service: Service; today: string }) {
  const [original, setOriginal] = useState(() =>
    toServiceFormValues(service, today),
  );
  const [values, setValues] = useState(original);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");
  // Los cobros no forman parte del formulario: "Marcar pagado" actúa al instante.
  const [charges, setCharges] = useState(service.charges);
  const [paidToday, setPaidToday] = useState<number[]>([]);

  const changes = getChanges(values, original);
  const errors = getErrors(values, tried);
  const isValid = getInvalidEditFields(values).length === 0;
  const company = getServiceCompany(service);

  function change(patch: Partial<ServiceFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  /** Al cancelar, el último día propuesto es la renovación. */
  function changeStatus(status: ServiceStatus) {
    change(
      status === "Cancelado" && !values.endDate
        ? { status, endDate: values.renewDate }
        : { status },
    );
  }

  function save() {
    if (!isValid) {
      setTried(true);
      return;
    }
    // El último día y el motivo solo se guardan con el estado "Cancelado".
    const saved =
      values.status === "Cancelado"
        ? values
        : { ...values, endDate: "", cancelReason: "" };
    setNotice(getSaveNotice(values, original, changes.length));
    setOriginal(saved);
    setValues(saved);
    setTried(false);
  }

  function discard() {
    setValues(original);
    setTried(false);
  }

  function markPaid(charge: ServiceCharge) {
    const paidDay = Number(today.slice(8));
    setCharges(
      charges.map((other) =>
        other.monthsAgo === charge.monthsAgo ? { ...other, paidDay } : other,
      ),
    );
    setPaidToday([...paidToday, charge.monthsAgo]);
    setNotice(
      `Cobro de ${getChargePeriod(today, charge.monthsAgo)} marcado como pagado.`,
    );
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Servicios", href: "/services" },
            { label: original.name },
          ]}
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">
                Editar servicio
              </h1>
              <ServiceStatusBadge status={original.status} />
            </div>
            <span className="text-sm text-ink-muted">
              {original.name} · {original.provider} ·{" "}
              <Link
                href={`/clients/${service.clientId}`}
                className="font-semibold"
              >
                {company}
              </Link>{" "}
              · {getSinceText(today, service.createdDaysAgo)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS[values.status].map(({ label, status }) => (
              <button
                key={label}
                type="button"
                className="crm-btn crm-btn-secondary px-3.5"
                onClick={() => changeStatus(status)}
              >
                <span
                  className={`size-2 rounded-full ${TONE_DOT_CLASSES[SERVICE_STATUS_TONES[status]]}`}
                />
                {label}
              </button>
            ))}
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={changes.length === 0}
            >
              <CheckIcon />
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {changes.length > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
        >
          <span className="size-2 rounded-full bg-accent" />
          <span className="min-w-0 flex-[1_1_220px]">
            <strong>
              {changes.length === 1 ? "1 cambio" : `${changes.length} cambios`}
            </strong>{" "}
            sin guardar: {changes.join(", ")}
          </span>
          <button
            type="button"
            className="crm-btn crm-btn-sm crm-btn-secondary"
            onClick={discard}
          >
            Descartar
          </button>
        </div>
      )}

      {notice && (
        <Alert variant="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {tried && !isValid && (
        <Alert variant="danger">
          Revisa los campos marcados antes de guardar.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <StatusSection
            values={values}
            original={original}
            onStatusChange={changeStatus}
            onChange={change}
          />
          <ServiceDataFields
            values={values}
            errors={errors}
            original={original}
            onChange={change}
          />
          <ServiceChargeFields
            values={values}
            errors={errors}
            original={original}
            onChange={change}
          />
          <ServiceRenewalFields
            values={values}
            errors={{}}
            today={today}
            original={original}
            onChange={change}
          />
          <ServiceNotesField
            notes={values.notes}
            original={original.notes}
            onChange={(notes) => change({ notes })}
          />
          <ServiceCharges
            charges={charges}
            paidToday={paidToday}
            today={today}
            onMarkPaid={markPaid}
          />
        </div>
        <ServiceSidebar
          service={service}
          values={values}
          original={original}
          charges={charges}
        />
      </div>
    </form>
  );
}

/** Estado, caja de baja al cancelar y aviso al pausar. */
function StatusSection({
  values,
  original,
  onStatusChange,
  onChange,
}: {
  values: ServiceFormValues;
  original: ServiceFormValues;
  onStatusChange: (status: ServiceStatus) => void;
  onChange: (changes: Partial<ServiceFormValues>) => void;
}) {
  const id = useId();
  const changed = values.status !== original.status;
  const cancelling =
    values.status === "Cancelado" && original.status !== "Cancelado";
  const pausing =
    values.status === "En pausa" && original.status !== "En pausa";

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 id={`${id}-heading`} className="crm-heading">
          Estado
        </h2>
        {changed && (
          <span className="text-xs font-bold text-accent">
            · {original.status} → {values.status}
          </span>
        )}
      </div>

      <PillRadioGroup
        label="Estado del servicio"
        hideLabel
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={onStatusChange}
      />

      {original.status === "Cancelado" && original.endDate && (
        <span className="text-compact text-ink-muted">
          Último día: {formatDate(original.endDate)}
          {original.cancelReason && ` · Motivo: ${original.cancelReason}`}
        </span>
      )}

      {cancelling && (
        <div className="flex flex-col gap-3 rounded-xl border border-tone-amber-line bg-tone-amber-bg p-4">
          <span className="text-sm leading-[1.45] text-tone-amber-fg">
            <strong>Recuerda darlo de baja en {original.provider}</strong> para
            no seguir pagando{" "}
            {formatCLP(toMonthly(original.cost, original.period))} al mes.
            Dejarás de cobrar{" "}
            {formatCLP(toMonthly(original.charge, original.period))} al mes.
          </span>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor={`${id}-end`}
                className="text-compact font-semibold"
              >
                Último día del servicio
              </FieldLabel>
              <input
                id={`${id}-end`}
                type="date"
                className="crm-field h-[42px] px-3 font-mono text-compact"
                value={values.endDate}
                onChange={(event) => onChange({ endDate: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel
                htmlFor={`${id}-reason`}
                className="text-compact font-semibold"
              >
                Motivo{" "}
                <span className="font-medium text-ink-muted">(opcional)</span>
              </FieldLabel>
              <input
                id={`${id}-reason`}
                type="text"
                autoComplete="off"
                className="crm-field h-[42px] px-3 text-compact"
                placeholder="Ej. El cliente migró a su propio servidor"
                value={values.cancelReason}
                onChange={(event) =>
                  onChange({ cancelReason: event.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}

      {pausing && (
        <span className="text-compact leading-[1.45] text-tone-amber-fg">
          En pausa no se cuenta en tu ingreso mensual ni te recordará la
          renovación. El costo del proveedor puede seguir corriendo.
        </span>
      )}
    </section>
  );
}
