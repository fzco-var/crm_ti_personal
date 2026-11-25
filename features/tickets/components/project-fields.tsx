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

interface ProjectFieldsProps {
  values: TicketFormValues;
  errors: TicketFormErrors;
  onChange: (changes: Partial<TicketFormValues>) => void;
  /** Solo en el alta: el cliente de `?client=`. */
  clientId?: string;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: TicketFormValues;
}

/**
 * Proyecto y solicitante. En el alta, con `clientId`, los proyectos de su
 * empresa van primero y él pasa a ser el solicitante. En la edición solo hay
 * dos campos, dentro de la sección "Detalle".
 */
export function ProjectFields(props: ProjectFieldsProps) {
  return props.original ? (
    <EditProjectFields {...props} original={props.original} />
  ) : (
    <NewProjectFields {...props} />
  );
}

function NewProjectFields({
  values,
  errors,
  clientId,
  onChange,
}: ProjectFieldsProps) {
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

/** Un solicitante ajeno a la empresa del nuevo proyecto pasa al principal; "Yo" se conserva. */
function EditProjectFields({
  values,
  original,
  onChange,
}: ProjectFieldsProps & { original: TicketFormValues }) {
  const id = useId();
  const project = findProjectById(values.projectId);
  const originalProject = findProjectById(original.projectId);
  const moved = values.projectId !== original.projectId;

  function changeProject(projectId: string) {
    const newProject = findProjectById(projectId);
    if (!newProject) return;
    const keepsRequester =
      values.requesterId === null ||
      getProjectContacts(newProject).some(
        ({ id: contactId }) => contactId === values.requesterId,
      );
    onChange({
      projectId,
      requesterId: keepsRequester ? values.requesterId : newProject.clientId,
    });
  }

  function getMoveText() {
    if (!project || !originalProject) return "";
    const from = getProjectCompany(originalProject);
    const to = getProjectCompany(project);
    const companyText =
      from === to ? "" : ` (cambia de cliente: ${from} → ${to})`;
    return `Se moverá de ${originalProject.code} a ${project.code}${companyText}.`;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-project`} modified={moved}>
          Proyecto
        </FieldLabel>
        <select
          id={`${id}-project`}
          className="crm-field px-3 text-sm"
          value={values.projectId}
          aria-describedby={moved ? `${id}-move` : undefined}
          onChange={(event) => changeProject(event.target.value)}
        >
          <ProjectOptions projects={PROJECT_OPTIONS} />
        </select>
        {moved && (
          <span
            id={`${id}-move`}
            className="text-compact leading-[1.45] text-tone-amber-fg"
          >
            {getMoveText()}
          </span>
        )}
      </div>
      {project && (
        <RequesterField
          project={project}
          requesterId={values.requesterId}
          modified={values.requesterId !== original.requesterId}
          onChange={(requesterId) => onChange({ requesterId })}
        />
      )}
    </div>
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
  modified,
  onChange,
}: {
  project: Project;
  requesterId: string | null;
  modified?: boolean;
  onChange: (requesterId: string | null) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} modified={modified}>
        Solicitado por
      </FieldLabel>
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
