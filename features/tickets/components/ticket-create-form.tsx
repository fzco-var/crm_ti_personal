"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { FieldLabel, TextField } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import { tickets } from "@/data/tickets";
import { findProjectById } from "@/features/projects/utils";
import { PillRadioGroup } from "@/components/pill-radio-group";
import { ProjectFields } from "@/features/tickets/components/project-fields";
import { StatusFields } from "@/features/tickets/components/status-fields";
import { TicketPreview } from "@/features/tickets/components/ticket-preview";
import { useToday } from "@/components/use-today";
import { TICKET_TYPES } from "@/features/tickets/constants";
import type {
  TicketFormErrors,
  TicketFormValues,
} from "@/features/tickets/types/ticket";
import { isPastDate, isValidTitle } from "@/features/tickets/utils";

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

const TYPE_OPTIONS = TICKET_TYPES.map((value) => ({ value }));

// El siguiente al mayor de los ejemplos: #T-1052.
const FIRST_CODE_NUMBER =
  Math.max(1000, ...tickets.map(({ code }) => Number(code.slice(3)))) + 1;

/** Nombre y proyecto se marcan al primer intento; la fecha pasada, al momento. */
function getErrors(
  values: TicketFormValues,
  tried: boolean,
  today: string | null,
): TicketFormErrors {
  const errors: TicketFormErrors = {};
  if (tried && !isValidTitle(values.title)) {
    errors.title = values.title.trim()
      ? "Usa al menos 6 caracteres para que se entienda."
      : "Ponle un nombre al ticket.";
  }
  if (tried && !values.projectId) {
    errors.projectId = "Elige a qué proyecto pertenece.";
  }
  if (isPastDate(values.dueDate, today)) {
    errors.dueDate = "La fecha límite no puede ser anterior a hoy.";
  }
  return errors;
}

/**
 * `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás.
 * `clientId` llega de `?client=` y ya está validado.
 */
export function TicketCreateForm({ clientId }: { clientId?: string }) {
  const { bfcacheId } = useRouter();
  return <CreateForm key={bfcacheId} clientId={clientId} />;
}

function CreateForm({ clientId }: { clientId?: string }) {
  const today = useToday();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState("");
  const [codeNumber, setCodeNumber] = useState(FIRST_CODE_NUMBER);

  const code = `#T-${codeNumber}`;
  const project = findProjectById(values.projectId);
  const errors = getErrors(values, tried, today);
  const isValid =
    isValidTitle(values.title) &&
    Boolean(project) &&
    !isPastDate(values.dueDate, today);

  function change(changes: Partial<TicketFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setSavedText("");
  }

  function create(createAnother: boolean) {
    if (!isValid || !project) {
      setTried(true);
      setSavedText("");
      return;
    }
    const text = `${code} «${values.title.trim()}» creado en ${project.code} · ${values.status}, prioridad ${values.priority.toLowerCase()}.`;
    setTried(false);

    if (createAnother) {
      const { projectId, requesterId, type } = values;
      setValues({ ...EMPTY_VALUES, projectId, requesterId, type });
      setCodeNumber(codeNumber + 1);
      setSavedText(`${text} Listo para el siguiente en el mismo proyecto.`);
    } else {
      setSavedText(text);
    }
  }

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        create(false);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
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
        <div className="flex flex-wrap gap-2.5">
          <Link href="/tickets" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={() => create(true)}
          >
            Crear y abrir otro
          </button>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Crear ticket
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/tickets"
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
          Revisa los campos marcados antes de crear el ticket.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <TicketSection
            code={code}
            values={values}
            errors={errors}
            onChange={change}
          />
          <ProjectFields
            values={values}
            errors={errors}
            clientId={clientId}
            onChange={change}
          />
          <StatusFields
            values={values}
            errors={errors}
            project={project}
            today={today}
            onChange={change}
          />
        </div>
        <TicketPreview code={code} values={values} />
      </div>
    </form>
  );
}

function TicketSection({
  code,
  values,
  errors,
  onChange,
}: {
  code: string;
  values: TicketFormValues;
  errors: TicketFormErrors;
  onChange: (changes: Partial<TicketFormValues>) => void;
}) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card">
      <h2 id={`${id}-heading`} className="crm-heading">
        Ticket
      </h2>
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(130px,1fr)] gap-5">
        <TextField
          label="Nombre del ticket"
          placeholder="Ej. El formulario de contacto no envía el correo"
          value={values.title}
          error={errors.title}
          onChange={(event) => onChange({ title: event.target.value })}
        >
          {!errors.title && (
            <span className="text-compact text-ink-muted">
              Describe el problema o la tarea en una línea.
            </span>
          )}
        </TextField>
        <div className="flex flex-col gap-1.5">
          <span className="crm-label">ID</span>
          <span className="flex h-[46px] items-center rounded-control border border-line bg-surface-muted px-3.5 font-mono text-sm text-ink-soft">
            {code}
          </span>
        </div>
      </div>

      <PillRadioGroup
        label="Tipo"
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={(type) => onChange({ type })}
      />

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-description`}>
          Descripción{" "}
          <span className="font-medium text-ink-muted">(opcional)</span>
        </FieldLabel>
        <textarea
          id={`${id}-description`}
          rows={4}
          className="crm-textarea"
          placeholder="Qué pasa, pasos para reproducirlo, en qué navegador o dispositivo y qué ya probaste."
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </div>
    </section>
  );
}
