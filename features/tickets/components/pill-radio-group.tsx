"use client";

import { useId } from "react";

export interface PillOption<T extends string> {
  value: T;
  /** Clase del punto de color, si lo lleva. */
  dotClassName?: string;
}

/** Radios nativos ocultos dentro de `.crm-pill`: las flechas cambian la opción. */
export function PillRadioGroup<T extends string>({
  label,
  options,
  value,
  modified,
  onChange,
}: {
  label: string;
  options: PillOption<T>[];
  value: T;
  modified?: boolean;
  onChange: (value: T) => void;
}) {
  const name = useId();

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="crm-label mb-2">
        {label}
        {modified && (
          <span className="text-xs font-bold text-accent"> · modificado</span>
        )}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option.value} className="crm-pill">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.dotClassName && (
              <span className={`size-2 rounded-full ${option.dotClassName}`} />
            )}
            {option.value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
