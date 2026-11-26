"use client";

import { useId, type ReactNode } from "react";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { TONE_DOT_CLASSES } from "@/components/tone";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { PROJECT_PRIORITIES } from "@/features/projects/constants";
import type {
  ProjectFormValues,
  ProjectStatus,
} from "@/features/projects/types/project";

// Un proyecto nuevo no empieza completado.
const NEW_PROJECT_STATUSES: { value: ProjectStatus; description: string }[] = [
  {
    value: "Planificado",
    description: "Aún no empieza. Estás afinando alcance y fechas.",
  },
  { value: "En curso", description: "Ya se está trabajando en él." },
  {
    value: "En pausa",
    description: "Detenido a la espera del cliente o de otra cosa.",
  },
];

// En la edición, en el orden de la plantilla.
const EDIT_PROJECT_STATUSES: ProjectStatus[] = [
  "Planificado",
  "En curso",
  "En pausa",
  "Completado",
];

const PRIORITY_OPTIONS = PROJECT_PRIORITIES.map(({ value, tone }) => ({
  value,
  dotClassName: TONE_DOT_CLASSES[tone],
}));

interface ProjectStatusFieldsProps {
  values: ProjectFormValues;
  onChange: (changes: Partial<ProjectFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ProjectFormValues;
  /** Aviso entre el estado y la prioridad, como el de hitos pendientes. */
  notice?: ReactNode;
  disabled?: boolean;
}

/** Estado y prioridad, con radios nativos: las flechas cambian la opción. */
export function ProjectStatusFields({
  values,
  onChange,
  original,
  notice,
  disabled,
}: ProjectStatusFieldsProps) {
  const id = useId();
  const modified =
    original &&
    (values.status !== original.status ||
      values.priority !== original.priority);

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 id={`${id}-heading`} className="crm-heading">
          {original ? "Estado y prioridad" : "Estado inicial"}
        </h2>
        {modified && (
          <span className="text-xs font-bold text-accent">· modificado</span>
        )}
      </div>

      {original ? (
        <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
          <legend className="sr-only">Estado del proyecto</legend>
          {EDIT_PROJECT_STATUSES.map((value) => (
            <label
              key={value}
              className="crm-option min-h-[52px] items-center gap-2.5 py-0 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-45"
            >
              <input
                type="radio"
                name={`${id}-status`}
                value={value}
                checked={values.status === value}
                disabled={disabled}
                onChange={() => onChange({ status: value })}
                className="mt-0"
              />
              <ProjectStatusBadge status={value} />
              {value === original.status && (
                <span className="text-xs text-ink-muted">actual</span>
              )}
            </label>
          ))}
        </fieldset>
      ) : (
        <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
          <legend className="sr-only">Estado del proyecto</legend>
          {NEW_PROJECT_STATUSES.map(({ value, description }) => (
            <label key={value} className="crm-option">
              <input
                type="radio"
                name={`${id}-status`}
                value={value}
                checked={values.status === value}
                onChange={() => onChange({ status: value })}
              />
              <span className="flex flex-col gap-1.5">
                <ProjectStatusBadge status={value} className="self-start" />
                <span className="text-compact leading-[1.45] text-ink-soft">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {notice}

      <PillRadioGroup
        label="Prioridad"
        options={PRIORITY_OPTIONS}
        value={values.priority}
        disabled={disabled}
        onChange={(priority) => onChange({ priority })}
      />
    </section>
  );
}
