"use client";

import { useId, type ReactNode } from "react";
import { Alert } from "@/components/alert";
import { FieldError, FieldLabel } from "@/components/form-field";
import { TONE_CLASSES } from "@/components/tone";
import { clients } from "@/data/clients";
import { projects } from "@/data/projects";
import { PROJECT_STATUS_TONES } from "@/features/projects/constants";
import type { Project } from "@/features/projects/types/project";
import {
  findProjectById,
  getProjectCompany,
  getProjectContacts,
} from "@/features/projects/utils";
import type {
  TicketFormErrors,
  TicketFormValues,
} from "@/features/tickets/types/ticket";
import {
  findDuplicateTicket,
  formatDays,
  getTicketsByProject,
} from "@/features/tickets/utils";

// Valor del `select` para `requesterId: null`.
const ME = "me";

const PROJECT_OPTIONS = [...projects].sort((a, b) =>
  a.code.localeCompare(b.code),
);

function getProjectNotice({ status, endInDays }: Project) {
  if (status === "Completado") {
    return "Este proyecto ya está completado. Si es un bug nuevo, quizás corresponde a la mantención del cliente o a un proyecto nuevo.";
  }
  if (endInDays < 0) {
    return `Este proyecto está atrasado ${formatDays(-endInDays)}.`;
  }
  if (status === "En pausa") {
    return "Este proyecto está en pausa. El ticket se creará igual, pero tenlo en cuenta al priorizar.";
  }
  return "";
}

/**
 * Proyecto y solicitante del alta. Con `clientId`, desde un cliente, los
 * proyectos de su empresa van primero y él pasa a ser el solicitante.
 */
export function ProjectFields({
  values,
  errors,
  clientId,
  onChange,
}: {
  values: TicketFormValues;
  errors: TicketFormErrors;
  clientId?: string;
  onChange: (changes: Partial<TicketFormValues>) => void;
}) {
  const id = useId();
  const project = findProjectById(values.projectId);
  const client = clients.find(({ id: other }) => other === clientId);

  function changeProject(projectId: string) {
    const newProject = findProjectById(projectId);
    if (!newProject) {
      onChange({ projectId, requesterId: null });
      return;
    }
    const isClientProject =
      client && getProjectCompany(newProject) === client.company;
    onChange({
      projectId,
      requesterId: isClientProject ? client.id : newProject.clientId,
    });
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-heading`} className="crm-heading">
          Proyecto vinculado
        </h2>
        <p className="text-sm text-ink-muted">
          El ticket queda asociado al ID del proyecto.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-project`}>Proyecto</FieldLabel>
        <select
          id={`${id}-project`}
          className="crm-field px-3"
          value={values.projectId}
          aria-invalid={errors.projectId ? true : undefined}
          aria-describedby={errors.projectId ? `${id}-error` : undefined}
          onChange={(event) => changeProject(event.target.value)}
        >
          <option value="">Elige un proyecto</option>
          {client ? (
            <ClientProjectOptions company={client.company} />
          ) : (
            <ProjectOptions projects={PROJECT_OPTIONS} />
          )}
        </select>
        <FieldError id={`${id}-error`}>{errors.projectId}</FieldError>
      </div>

      {project && <ProjectSummary project={project} />}
      {project && getProjectNotice(project) && (
        <Alert variant="warning">{getProjectNotice(project)}</Alert>
      )}
      <DuplicateNotice title={values.title} projectId={values.projectId} />

      {project && (
        <RequesterField
          project={project}
          requesterId={values.requesterId}
          onChange={(requesterId) => onChange({ requesterId })}
        />
      )}
    </section>
  );
}

function ProjectOptions({ projects: options }: { projects: Project[] }) {
  return options.map(({ id, code, name }) => (
    <option key={id} value={id}>
      {code} · {name}
    </option>
  ));
}

function ClientProjectOptions({ company }: { company: string }) {
  const own = PROJECT_OPTIONS.filter(
    (project) => getProjectCompany(project) === company,
  );
  const others = PROJECT_OPTIONS.filter((project) => !own.includes(project));

  return (
    <>
      <optgroup label={`Proyectos de ${company}`}>
        <ProjectOptions projects={own} />
      </optgroup>
      <optgroup label="Otros proyectos">
        <ProjectOptions projects={others} />
      </optgroup>
    </>
  );
}

function ProjectSummary({ project }: { project: Project }) {
  const openCount = getTicketsByProject(project.id).filter(
    ({ status }) => status !== "Cerrado",
  ).length;

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-4 rounded-xl bg-surface-muted p-4">
      <SummaryItem label="Cliente" className="flex-[1_1_200px]">
        <span className="text-sm font-bold">{getProjectCompany(project)}</span>
      </SummaryItem>
      <SummaryItem label="Estado" className="flex-[1_1_140px]">
        <span
          className={`crm-badge self-start ${TONE_CLASSES[PROJECT_STATUS_TONES[project.status]]}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {project.status}
        </span>
      </SummaryItem>
      <SummaryItem label="Tickets sin cerrar" className="flex-[1_1_140px]">
        <span className="font-mono text-sm">{openCount}</span>
      </SummaryItem>
    </dl>
  );
}

function SummaryItem({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <dt className="text-xs font-bold tracking-[0.04em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="flex flex-col">{children}</dd>
    </div>
  );
}

function DuplicateNotice({
  title,
  projectId,
}: {
  title: string;
  projectId: string;
}) {
  const duplicate = findDuplicateTicket(title, projectId);
  if (!duplicate) return null;

  return (
    <Alert variant="warning">
      ¿Es el mismo que <strong className="font-mono">{duplicate.code}</strong> «
      {duplicate.title}» ({duplicate.status.toLowerCase()})? Revísalo antes de
      duplicar.
    </Alert>
  );
}

function RequesterField({
  project,
  requesterId,
  onChange,
}: {
  project: Project;
  requesterId: string | null;
  onChange: (requesterId: string | null) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>Solicitado por</FieldLabel>
      <select
        id={id}
        className="crm-field px-3"
        value={requesterId ?? ME}
        onChange={(event) =>
          onChange(event.target.value === ME ? null : event.target.value)
        }
      >
        {getProjectContacts(project).map((contact) => (
          <option key={contact.id} value={contact.id}>
            {contact.firstName} {contact.lastName} · {contact.role}
          </option>
        ))}
        <option value={ME}>Yo (lo detecté yo)</option>
      </select>
    </div>
  );
}
