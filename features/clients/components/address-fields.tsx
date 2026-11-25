"use client";

import { useId } from "react";
import { CopyIcon } from "@/components/icons";
import {
  FieldError,
  FieldLabel,
  TextField,
  type ClientFieldsProps,
} from "@/features/clients/components/form-field";
import { REGIONS } from "@/features/clients/constants";
import { findCompany } from "@/features/clients/utils";

export function AddressFields(props: ClientFieldsProps) {
  const { values, errors, onChange, original } = props;
  const headingId = useId();
  const company = original ? undefined : findCompany(values.company);
  const modified =
    original &&
    (values.street !== original.street ||
      values.unit !== original.unit ||
      values.city !== original.city ||
      values.region !== original.region);

  return (
    <section aria-labelledby={headingId} className="crm-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id={headingId} className="crm-heading">
              Dirección
            </h2>
            {modified && (
              <span className="text-xs font-bold text-accent">
                · modificada
              </span>
            )}
          </div>
          {!original && (
            <p className="text-sm text-ink-muted">
              Donde atiendes al cliente o envías equipos.
            </p>
          )}
        </div>
        {company && (
          <button
            type="button"
            className="crm-btn crm-btn-sm crm-btn-secondary"
            onClick={() =>
              onChange({
                street: company.street,
                unit: company.unit,
                city: company.city,
                region: company.region,
              })
            }
          >
            <CopyIcon />
            Usar la dirección de la empresa
          </button>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
        <div className="col-span-full">
          <TextField
            label="Calle y número"
            placeholder={original ? undefined : "Ej. Av. Los Aromos 1450"}
            value={values.street}
            error={errors.street}
            onChange={(event) => onChange({ street: event.target.value })}
          />
        </div>
        <TextField
          label={
            <>
              Depto., oficina o piso{" "}
              <span className="font-medium text-ink-muted">(opcional)</span>
            </>
          }
          placeholder={original ? undefined : "Ej. of. 302"}
          value={values.unit}
          onChange={(event) => onChange({ unit: event.target.value })}
        />
        <TextField
          label="Comuna o ciudad"
          placeholder={original ? undefined : "Ej. Providencia"}
          value={values.city}
          error={errors.city}
          onChange={(event) => onChange({ city: event.target.value })}
        />
        <RegionField {...props} />
      </div>
    </section>
  );
}

function RegionField({ values, errors, onChange }: ClientFieldsProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>Región</FieldLabel>
      <select
        id={id}
        className="crm-field px-3"
        value={values.region}
        aria-invalid={errors.region ? true : undefined}
        aria-describedby={errors.region ? errorId : undefined}
        onChange={(event) => onChange({ region: event.target.value })}
      >
        <option value="">Elige una región</option>
        {REGIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <FieldError id={errorId}>{errors.region}</FieldError>
    </div>
  );
}
