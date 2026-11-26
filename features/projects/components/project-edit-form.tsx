"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckIcon, WarningIcon } from "@/components/icons";
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
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectStatusFields } from "@/features/projects/components/project-status-fields";
import type {
  Project,
  ProjectFormValues,
  ProjectHistoryEntry,
} from "@/features/projects/types/project";
import {
  areMilestonesEqual,
  formatDayDelta,
  isEndBeforeStart,
  isValidProject,
  toProjectFormValues,
} from "@/features/projects/utils";
import { addDays, formatDate, getDaysUntil } from "@/features/tickets/utils";

type ChangeKey =
  | "name"
  | "clientId"
  | "description"
  | "status"
  | "priority"
  | "dates"
  | "milestones";

// En el orden en que se listan los cambios sin guardar.
const CHANGE_LABELS: [ChangeKey, string][] = [
  ["name", "nombre"],
  ["clientId", "cliente"],
  ["description", "descripción"],
  ["status", "estado"],
  ["priority", "prioridad"],
  ["dates", "fechas"],
  ["milestones", "hitos"],
];

function hasChanged(
  key: ChangeKey,
  values: ProjectFormValues,
  original: ProjectFormValues,
) {
  if (key === "dates") {
    return (
      values.startDate !== original.startDate ||
      values.endDate !== original.endDate
    );
  }
  if (key === "milestones") {
    return !areMilestonesEqual(values.milestones, original.milestones);
  }
  return values[key] !== original[key];
}

function getChanges(values: ProjectFormValues, original: ProjectFormValues) {
  return CHANGE_LABELS.filter(([key]) => hasChanged(key, values, original)).map(
    ([key, label]) =>
      key === "status"
        ? `estado (${original.status} → ${values.status})`
        : label,
  );
}

/** Nombre e inicio se marcan al intentar guardar; el término, al momento. */
function getErrors(
  values: ProjectFormValues,
  tried: boolean,
): ProjectDataErrors & ProjectDateErrors {
  const errors: ProjectDataErrors & ProjectDateErrors = {};
  if (tried && !values.name.trim()) {
    errors.name = "El nombre no puede quedar vacío.";
  }
  if (tried && !values.startDate) {
    errors.startDate = "Indica cuándo empieza.";
  }
  if (!values.endDate) {
    errors.endDate = "Indica la fecha de término.";
  } else if (isEndBeforeStart(values.startDate, values.endDate)) {
    errors.endDate = "Termina antes de empezar: revisa las fechas.";
  }
  return errors;
}

/** Entradas que añade guardar: cambio de estado y término movido. */
function getSaveEntries(
  values: ProjectFormValues,
  original: ProjectFormValues,
  reason: string,
): ProjectHistoryEntry[] {
  const entries: ProjectHistoryEntry[] = [];
  if (values.status !== original.status) {
    entries.push({
      text: `Estado: ${original.status} → ${values.status}`,
      daysAgo: 0,
    });
  }
  if (values.endDate && values.endDate !== original.endDate) {
    const delta = getDaysUntil(values.endDate, original.endDate);
    const motive = reason.trim() ? ` · motivo: ${reason.trim()}` : "";
    entries.push({
      text: `Término movido ${formatDayDelta(delta)}${motive}`,
      daysAgo: 0,
    });
  }
  return entries;
}

/**
 * `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás.
 * Las fechas dependen del día del navegador: sin él, no hay formulario.
 */
export function ProjectEditForm({ project }: { project: Project }) {
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
  return <EditForm key={bfcacheId} project={project} today={today} />;
}

function EditForm({ project, today }: { project: Project; today: string }) {
  const [original, setOriginal] = useState(() =>
    toProjectFormValues(project, today),
  );
  const [values, setValues] = useState(original);
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState(project.history);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");

  const changes = getChanges(values, original);
  const errors = getErrors(values, tried);
  const isValid = isValidProject(values);
  const pending = values.milestones.filter(({ done }) => !done).length;

  function change(patch: Partial<ProjectFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function save() {
    if (!isValid) {
      setTried(true);
      return;
    }
    setHistory([...getSaveEntries(values, original, reason), ...history]);
    setOriginal(values);
    setReason("");
    setTried(false);
    setNotice(`Cambios guardados (${changes.length}).`);
  }

  function discard() {
    setValues(original);
    setReason("");
    setTried(false);
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Operación" },
            { label: "Proyectos", href: "/projects" },
            { label: project.code },
          ]}
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">
                Editar proyecto
              </h1>
              <ProjectStatusBadge status={original.status} />
            </div>
            <span className="text-sm text-ink-muted">
              <span className="font-mono">{project.code}</span> ·{" "}
              {original.name} · creado el{" "}
              {formatDate(addDays(today, -project.createdDaysAgo))}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/projects" className="crm-btn crm-btn-secondary">
              Volver
            </Link>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={changes.length === 0}
            >
              <CheckIcon />
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {changes.length > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
        >
          <span className="size-2 rounded-full bg-accent" />
          <span className="min-w-0 flex-[1_1_220px]">
            <strong>
              {changes.length === 1 ? "1 cambio" : `${changes.length} cambios`}
            </strong>{" "}
            sin guardar: {changes.join(", ")}
          </span>
          <button
            type="button"
            className="crm-btn crm-btn-sm crm-btn-secondary"
            onClick={discard}
          >
            Descartar
          </button>
        </div>
      )}

      {notice && (
        <Alert variant="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {tried && !isValid && (
        <Alert variant="danger">
          Revisa los campos marcados antes de guardar.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ProjectDataFields
            values={values}
            errors={errors}
            original={original}
            onChange={change}
          />
          <ProjectStatusFields
            values={values}
            original={original}
            onChange={change}
            notice={
              values.status === "Completado" &&
              pending > 0 && (
                <PendingNotice
                  pending={pending}
                  onCompleteAll={() =>
                    change({
                      milestones: values.milestones.map((milestone) => ({
                        ...milestone,
                        done: true,
                      })),
                    })
                  }
                />
              )
            }
          />
          <ProjectDateFields
            values={values}
            errors={errors}
            today={today}
            original={original}
            reason={reason}
            onReasonChange={setReason}
            onChange={change}
          />
          <ProjectMilestones
            milestones={values.milestones}
            startDate={values.startDate}
            endDate={values.endDate}
            today={today}
            original={original.milestones}
            onChange={(milestones) => change({ milestones })}
          />
        </div>
      </div>
    </form>
  );
}

function PendingNotice({
  pending,
  onCompleteAll,
}: {
  pending: number;
  onCompleteAll: () => void;
}) {
  return (
    <div
      role="note"
      className="flex flex-wrap items-center gap-2.5 rounded-control border border-tone-amber-line bg-tone-amber-bg px-3.5 py-3 text-sm leading-[1.45] text-tone-amber-fg"
    >
      <WarningIcon className="flex-none text-warning" />
      <span className="min-w-[200px] flex-1">
        Lo marcas como completado pero quedan{" "}
        <strong>{pending === 1 ? "1 hito" : `${pending} hitos`}</strong>{" "}
        pendientes.
      </span>
      <button
        type="button"
        className="crm-btn crm-btn-sm crm-btn-secondary border-tone-amber-line text-tone-amber-fg"
        onClick={onCompleteAll}
      >
        Marcar todos como hechos
      </button>
    </div>
  );
}
