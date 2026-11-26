"use client";

import { useId } from "react";
import { SERVICE_TYPES } from "@/features/services/constants";
import type {
  ServiceFormValues,
  ServiceType,
} from "@/features/services/types/service";

/** Solo en el alta: Mantención deja el costo en 0 (tu tiempo no cuenta). */
export function ServiceTypeFields({
  values,
  onChange,
}: {
  values: ServiceFormValues;
  onChange: (changes: Partial<ServiceFormValues>) => void;
}) {
  const id = useId();

  function pick(type: ServiceType) {
    onChange(type === "Mantención" ? { type, cost: 0 } : { type });
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <h2 id={`${id}-heading`} className="crm-heading">
        ¿Qué tipo de servicio es?
      </h2>
      <fieldset className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-2.5">
        <legend className="sr-only">Tipo de servicio</legend>
        {SERVICE_TYPES.map(({ value, description }) => (
          <label key={value} className="crm-option">
            <input
              type="radio"
              name={`${id}-type`}
              value={value}
              checked={values.type === value}
              onChange={() => pick(value)}
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-bold">{value}</span>
              <span className="text-compact leading-[1.45] text-ink-soft">
                {description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
