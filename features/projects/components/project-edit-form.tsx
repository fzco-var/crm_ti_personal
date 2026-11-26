"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import type { Project } from "@/features/projects/types/project";

// Se completa en el paso 14 del SPEC 05.
export function ProjectEditForm({ project }: { project: Project }) {
  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Proyectos", href: "/projects" },
            { label: project.code },
          ]}
        />
        <h1 className="crm-title">{project.name}</h1>
      </div>
    </div>
  );
}
