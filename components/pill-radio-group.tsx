"use client";

import { useId } from "react";

export interface PillOption<T extends string> {
  value: T;
  /** Texto visible; por defecto, `value`. */
  label?: string;
  /** Clase del punto de color, si lo lleva. */
  dotClassName?: string;
}

/** Radios nativos ocultos dentro de `.crm-pill`: las flechas cambian la opción. */
export function PillRadioGroup<T extends string>({
  label,
  options,
  value,
  modified,
  modifiedText = "modificado",
  hideLabel,
  disabled,
  onChange,
}: {
  label: string;
  options: PillOption<T>[];
  value: T;
  modified?: boolean;
  /** "modificada" si la etiqueta es femenina. */
  modifiedText?: string;
  /** Solo para lectores de pantalla, si un título visible ya lo nombra. */
  hideLabel?: boolean;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const name = useId();

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className={hideLabel ? "sr-only" : "crm-label mb-2"}>
        {label}
        {modified && (
          <span className="text-xs font-bold text-accent">
            {" "}
            · {modifiedText}
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="crm-pill has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-45"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.dotClassName && (
              <span className={`size-2 rounded-full ${option.dotClassName}`} />
            )}
            {option.label ?? option.value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
