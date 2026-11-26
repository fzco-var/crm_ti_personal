"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import {
  ProjectDataFields,
  type ProjectDataErrors,
} from "@/features/projects/components/project-data-fields";
import {
  ProjectDateFields,
  type ProjectDateErrors,
} from "@/features/projects/components/project-date-fields";
import { ProjectMilestones } from "@/features/projects/components/project-milestones";
import { ProjectPreview } from "@/features/projects/components/project-preview";
import { ProjectStatusFields } from "@/features/projects/components/project-status-fields";
import type { ProjectFormValues } from "@/features/projects/types/project";
import {
  findProjectClient,
  isEndBeforeStart,
  isValidProject,
} from "@/features/projects/utils";
import { formatDate } from "@/features/tickets/utils";

const NEXT_CODE = "PRJ-026";

/**
 * Nombre, cliente, inicio y término vacío se marcan al primer intento; el
 * término anterior al inicio, al momento.
 */
function getErrors(
  values: ProjectFormValues,
  tried: boolean,
): ProjectDataErrors & ProjectDateErrors {
  const errors: ProjectDataErrors & ProjectDateErrors = {};
  if (tried && !values.name.trim()) {
    errors.name = "Ponle un nombre al proyecto.";
  }
  if (tried && !values.clientId) {
    errors.clientId = "Elige a qué cliente pertenece.";
  }
  if (tried && !values.startDate) {
    errors.startDate = "Indica cuándo empieza.";
  }
  if (isEndBeforeStart(values.startDate, values.endDate)) {
    errors.endDate = "Termina antes de empezar: revisa las fechas.";
  } else if (tried && !values.endDate) {
    errors.endDate = "Indica cuándo debería terminar.";
  }
  return errors;
}

/**
 * `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás. El
 * inicio por defecto es hoy, que solo se conoce en el navegador.
 */
export function ProjectCreateForm() {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando proyecto…
        </p>
      </div>
    );
  }
  return <CreateForm key={bfcacheId} today={today} />;
}

function CreateForm({ today }: { today: string }) {
  const [values, setValues] = useState<ProjectFormValues>(() => ({
    name: "",
    clientId: "",
    description: "",
    status: "Planificado",
    priority: "Media",
    startDate: today,
    endDate: "",
    milestones: [],
  }));
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState("");

  const errors = getErrors(values, tried);
  const isValid = isValidProject(values);

  function change(changes: Partial<ProjectFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setSavedText("");
  }

  /** Sin persistencia: muestra el aviso y conserva los valores. */
  function create() {
    const client = findProjectClient(values.clientId);
    if (!isValid || !client) {
      setTried(true);
      setSavedText("");
      return;
    }
    setTried(false);
    setSavedText(
      `Proyecto ${NEXT_CODE} «${values.name.trim()}» creado para ${client.firstName} ${client.lastName} (${client.company}). Termina el ${formatDate(values.endDate)}.`,
    );
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
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
        <div className="flex flex-wrap gap-2.5">
          <Link href="/projects" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Crear proyecto
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/projects"
              className="crm-hit font-bold text-tone-green-fg underline"
            >
              Ver listado
            </Link>
          }
        >
          {savedText}
        </Alert>
      )}

      {tried && !isValid && (
        <Alert variant="danger">
          Revisa los campos marcados antes de crear el proyecto.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ProjectDataFields
            values={values}
            errors={errors}
            code={NEXT_CODE}
            onChange={change}
          />
          <ProjectStatusFields values={values} onChange={change} />
          <ProjectDateFields
            values={values}
            errors={errors}
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
        <ProjectPreview code={NEXT_CODE} values={values} today={today} />
      </div>
    </form>
  );
}
