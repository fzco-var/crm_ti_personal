"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { findProjectById } from "@/features/projects/utils";
import { ProjectFields } from "@/features/tickets/components/project-fields";
import { StatusFields } from "@/features/tickets/components/status-fields";
import type { TicketFormValues } from "@/features/tickets/types/ticket";

const EMPTY_VALUES: TicketFormValues = {
  title: "",
  type: "Bug",
  description: "",
  projectId: "",
  requesterId: null,
  status: "Abierto",
  priority: "Media",
  dueDate: "",
  waitingFor: "",
  resolution: "",
};

// Paso 11 del SPEC 04: solo muestra los campos; el paso 12 completa el alta.
export function TicketCreateForm() {
  const [values, setValues] = useState(EMPTY_VALUES);

  function change(changes: Partial<TicketFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Tickets", href: "/tickets" },
            { label: "Nuevo ticket" },
          ]}
        />
        <h1 className="crm-title">Nuevo ticket</h1>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <ProjectFields values={values} errors={{}} onChange={change} />
        <StatusFields
          values={values}
          errors={{}}
          project={findProjectById(values.projectId)}
          today={null}
          onChange={change}
        />
      </div>
    </div>
  );
}
