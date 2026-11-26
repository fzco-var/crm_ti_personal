"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ChevronDownIcon,
  CodeIcon,
  GlobeIcon,
  MaintenanceIcon,
  PencilIcon,
  ServerIcon,
  WarningIcon,
} from "@/components/icons";
import { ServiceStatusBadge } from "@/features/services/components/service-status-badge";
import type { Service, ServiceType } from "@/features/services/types/service";
import {
  type ServiceSortKey,
  type ServicesSort,
  formatCLP,
  getMargin,
  getMarginPercent,
  getRenewalText,
  getServiceCompany,
  getServiceProject,
  isLowMargin,
  isRenewalOverdue,
  isRenewalSoon,
  sortServices,
} from "@/features/services/utils";
import { addDays, formatDate } from "@/features/tickets/utils";

const SERVICE_COLUMNS: {
  label: string;
  sortKey: ServiceSortKey;
  className: string;
}[] = [
  { label: "Servicio", sortKey: "name", className: "" },
  { label: "Cliente / proyecto", sortKey: "company", className: "w-[19%]" },
  { label: "Cobro", sortKey: "charge", className: "w-[18%]" },
  { label: "Próxima renovación", sortKey: "renewal", className: "w-[16%]" },
  { label: "Estado", sortKey: "status", className: "w-[120px]" },
];

const TYPE_ICONS: Record<ServiceType, ComponentType> = {
  Mantención: MaintenanceIcon,
  "Hosting e infraestructura": ServerIcon,
  "Dominios y SSL": GlobeIcon,
  "Licencias y APIs": CodeIcon,
};

/** `today` es nula durante el prerender: la fecha se muestra al conocerla. */
export function ServicesTable({
  services,
  sort,
  today,
  onSortChange,
}: {
  services: Service[];
  sort: ServicesSort;
  today: string | null;
  onSortChange: (sort: ServicesSort) => void;
}) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table min-w-[1020px]">
        <thead>
          <tr>
            {SERVICE_COLUMNS.map((column) => (
              <SortableHeader
                key={column.sortKey}
                {...column}
                sort={sort}
                onSortChange={onSortChange}
              />
            ))}
            {/* `relative` evita que el texto oculto desborde la página. */}
            <th scope="col" className="relative w-[60px]">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortServices(services, sort).map((service) => (
            <ServiceRow key={service.id} service={service} today={today} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  className,
  sort,
  onSortChange,
}: {
  label: string;
  sortKey: ServiceSortKey;
  className: string;
  sort: ServicesSort;
  onSortChange: (sort: ServicesSort) => void;
}) {
  const active = sort.key === sortKey;
  const descending = active && sort.direction === "descending";

  return (
    <th
      scope="col"
      aria-sort={active ? sort.direction : "none"}
      className={`whitespace-nowrap ${className}`}
    >
      <button
        type="button"
        className={`crm-sort ${active ? "text-ink" : ""}`}
        onClick={() =>
          onSortChange({
            key: sortKey,
            direction: active && !descending ? "descending" : "ascending",
          })
        }
      >
        {label}
        <ChevronDownIcon
          className={`${active ? "" : "opacity-35"} ${descending ? "rotate-180" : ""}`}
        />
      </button>
    </th>
  );
}

function ServiceRow({
  service,
  today,
}: {
  service: Service;
  today: string | null;
}) {
  const TypeIcon = TYPE_ICONS[service.type];
  const cancelled = service.status === "Cancelado";
  const project = getServiceProject(service);
  const overdue = isRenewalOverdue(service);
  const soon = isRenewalSoon(service);
  const renewalTone = overdue
    ? "font-bold text-danger"
    : soon
      ? "font-bold text-warning"
      : "font-medium text-ink-muted";
  const margin = getMargin(service.charge, service.cost);

  return (
    <tr>
      <th scope="row" className="pl-5">
        <span className="flex items-start gap-3">
          <span className="flex size-9 flex-none items-center justify-center rounded-[9px] border border-line bg-canvas text-ink-soft">
            <TypeIcon />
          </span>
          <span className="flex min-w-0 flex-col gap-[3px]">
            <Link
              href={`/services/${service.id}`}
              className={`font-bold underline-offset-[3px] hover:underline ${
                cancelled ? "text-ink-muted line-through" : "text-ink"
              }`}
            >
              {service.name}
            </Link>
            <span className="text-xs font-normal text-ink-muted">
              {service.provider}
            </span>
          </span>
        </span>
      </th>
      <td>
        <span className="flex flex-col gap-1">
          <Link
            href={`/clients/${service.clientId}`}
            className="self-start font-semibold text-ink underline-offset-[3px] hover:underline"
          >
            {getServiceCompany(service)}
          </Link>
          {project && (
            <Link
              href={`/projects/${project.id}`}
              className="self-start rounded-md border border-line bg-surface-muted px-2 py-px font-mono text-xs font-medium text-ink-soft underline-offset-[3px] hover:underline"
            >
              {project.code}
            </Link>
          )}
        </span>
      </td>
      <td className="whitespace-nowrap">
        <span className="flex flex-col gap-0.5">
          <span className="font-mono font-medium text-ink">
            {formatCLP(service.charge)}
            <span className="font-sans text-xs text-ink-muted">
              {" "}
              / {service.period}
            </span>
          </span>
          <span className="text-xs text-ink-muted">
            Costo {service.cost ? formatCLP(service.cost) : "$0 (tu tiempo)"}
          </span>
          <span
            className={`text-xs font-bold ${
              isLowMargin(service.charge, service.cost)
                ? "text-warning"
                : "text-tone-green-fg"
            }`}
          >
            Margen {formatCLP(margin)}
            {service.charge
              ? ` · ${getMarginPercent(service.charge, service.cost)}%`
              : ""}
          </span>
        </span>
      </td>
      <td className="whitespace-nowrap">
        <span className="flex flex-col gap-0.5">
          <span className="min-h-5 font-mono text-[13px] text-ink">
            {today && formatDate(addDays(today, service.renewInDays))}
          </span>
          <span className={`flex items-center gap-1.5 text-xs ${renewalTone}`}>
            {(overdue || soon) && <WarningIcon size={12} strokeWidth={2.4} />}
            {getRenewalText(service)}
          </span>
          {!cancelled && (
            <span className="text-2xs text-ink-muted">
              {service.autoRenew
                ? "Renovación automática"
                : "Renovación manual"}
            </span>
          )}
        </span>
      </td>
      <td className="whitespace-nowrap">
        <ServiceStatusBadge status={service.status} />
      </td>
      <td className="py-2 pr-5 pl-2">
        <Link
          href={`/services/${service.id}`}
          className="crm-icon-btn"
          aria-label={`Editar ${service.name}`}
        >
          <PencilIcon />
        </Link>
      </td>
    </tr>
  );
}
