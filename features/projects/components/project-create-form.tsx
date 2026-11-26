"use client";

import Link from "next/link";
import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { useToday } from "@/components/use-today";
import { ProjectDataFields } from "@/features/projects/components/project-data-fields";
import { ProjectDateFields } from "@/features/projects/components/project-date-fields";
import { ProjectMilestones } from "@/features/projects/components/project-milestones";
import { ProjectStatusFields } from "@/features/projects/components/project-status-fields";
import type { ProjectFormValues } from "@/features/projects/types/project";

const NEXT_CODE = "PRJ-026";

const EMPTY_VALUES: ProjectFormValues = {
  name: "",
  clientId: "",
  description: "",
  status: "Planificado",
  priority: "Media",
  startDate: "",
  endDate: "",
  milestones: [],
};

// Se completa en el paso 12 del SPEC 05: validación, aviso y reinicio.
export function ProjectCreateForm() {
  const today = useToday();
  const [values, setValues] = useState(EMPTY_VALUES);

  function change(changes: Partial<ProjectFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  return (
    <form className="crm-content" noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[
              { label: "Operación" },
              { label: "Proyectos", href: "/projects" },
              { label: "Nuevo proyecto" },
            ]}
          />
          <h1 className="crm-title">Nuevo proyecto</h1>
        </div>
        <Link href="/projects" className="crm-btn crm-btn-secondary">
          Cancelar
        </Link>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <ProjectDataFields
          values={values}
          errors={{}}
          code={NEXT_CODE}
          onChange={change}
        />
        <ProjectStatusFields values={values} onChange={change} />
        <ProjectDateFields
          values={values}
          errors={{}}
          today={today}
          onChange={change}
        />
        <ProjectMilestones
          milestones={values.milestones}
          startDate={values.startDate}
          endDate={values.endDate}
          onChange={(milestones) => change({ milestones })}
        />
      </div>
    </form>
  );
}
