"use client";

import { useId, type ReactNode } from "react";
import { RoleBadge } from "@/features/clients/components/role-badge";
import type { ClientFormValues } from "@/features/clients/types/client";
import {
  formatPhone,
  getInitials,
  getInvalidFields,
  isValidPhone,
} from "@/features/clients/utils";

const TOTAL_FIELDS = 8;

/** La comuna y la región cuentan como un solo campo. */
function countCompleteFields(values: ClientFormValues) {
  const invalid = new Set(
    getInvalidFields(values).map((field) =>
      field === "region" ? "city" : field,
    ),
  );
  return TOTAL_FIELDS - invalid.size;
}

export function ClientPreview({ values }: { values: ClientFormValues }) {
  const headingId = useId();
  const complete = countCompleteFields(values);
  const fullName =
    `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
  const streetLine = [values.street.trim(), values.unit.trim()]
    .filter(Boolean)
    .join(", ");
  const cityLine = [values.city.trim(), values.region]
    .filter(Boolean)
    .join(", ");

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Vista previa
      </h2>
      <div className="flex items-center gap-3">
        <span className="flex size-11 flex-none items-center justify-center rounded-full bg-canvas font-mono text-sm font-medium text-ink-soft">
          {getInitials(values.firstName, values.lastName)}
        </span>
        <span className="flex min-w-0 flex-col items-start gap-1">
          <span className="max-w-full truncate text-field font-bold">
            {fullName || "Nombre Apellido"}
          </span>
          {values.role && <RoleBadge role={values.role} />}
        </span>
      </div>
      <dl className="flex flex-col gap-3 text-compact">
        <PreviewItem label="Empresa" className="font-semibold">
          {values.company.trim() || "—"}
        </PreviewItem>
        <PreviewItem label="Teléfono" className="font-mono">
          {isValidPhone(values.phonePrefix, values.phone)
            ? formatPhone(values.phonePrefix, values.phone)
            : "—"}
        </PreviewItem>
        <PreviewItem label="Correo">{values.email || "—"}</PreviewItem>
        <PreviewItem label="Dirección" className="leading-[1.45]">
          {streetLine || "—"}
          <br />
          {cityLine}
        </PreviewItem>
      </dl>
      <div className="flex items-center gap-2.5 border-t border-line-soft pt-4">
        <span
          aria-hidden="true"
          className="flex h-1.5 flex-1 overflow-hidden rounded-[3px] bg-line-soft"
        >
          <span
            className="h-full rounded-[3px] bg-ink"
            style={{ width: `${(complete / TOTAL_FIELDS) * 100}%` }}
          />
        </span>
        <span className="font-mono text-xs text-ink-muted">
          {complete}/{TOTAL_FIELDS} campos
        </span>
      </div>
    </aside>
  );
}

function PreviewItem({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`wrap-anywhere ${className}`}>{children}</dd>
    </div>
  );
}
