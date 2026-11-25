"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { AddressFields } from "@/features/clients/components/address-fields";
import { ContactFields } from "@/features/clients/components/contact-fields";
import type {
  ClientFieldsProps,
  ClientFormErrors,
} from "@/features/clients/components/form-field";
import { NotesField } from "@/features/clients/components/notes-field";
import { RoleBadge } from "@/features/clients/components/role-badge";
import { RoleFields } from "@/features/clients/components/role-fields";
import type { Client, ClientFormValues } from "@/features/clients/types/client";
import {
  formatPhone,
  getInitials,
  getInvalidFields,
  getPhoneDigits,
  getPhoneLengthError,
} from "@/features/clients/utils";

function getErrors(values: ClientFormValues): ClientFormErrors {
  const messages: ClientFormErrors = {
    firstName: "El nombre no puede quedar vacío.",
    lastName: "El apellido no puede quedar vacío.",
    company: "Indica la empresa del contacto.",
    phone: getPhoneLengthError(values.phonePrefix, values.phone),
    email: "Ese correo no parece válido.",
    street: "Escribe la calle y el número.",
    city: "Escribe la comuna o ciudad.",
    region: "Elige la región.",
    role: "Elige el rol del contacto.",
  };
  return Object.fromEntries(
    getInvalidFields(values).map((field) => [field, messages[field]]),
  );
}

/** Nombres de los cambios; el teléfono y la dirección cuentan como uno. */
function getChanges(values: ClientFormValues, original: ClientFormValues) {
  const groups: [string, (keyof ClientFormValues)[]][] = [
    ["nombre", ["firstName"]],
    ["apellido", ["lastName"]],
    ["empresa", ["company"]],
    ["teléfono", ["phonePrefix", "phone"]],
    ["correo", ["email"]],
    ["dirección", ["street", "unit", "city", "region"]],
    [`rol (${original.role} → ${values.role})`, ["role"]],
    ["notas", ["notes"]],
  ];
  return groups
    .filter(([, fields]) =>
      fields.some((field) => values[field] !== original[field]),
    )
    .map(([label]) => label);
}

/** `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás. */
export function ClientEditForm({ client }: { client: Client }) {
  const { bfcacheId } = useRouter();
  return <EditForm key={bfcacheId} client={client} />;
}

function EditForm({ client }: { client: Client }) {
  const [values, setValues] = useState<ClientFormValues>(client);
  const [original, setOriginal] = useState<ClientFormValues>(client);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");

  const errors = tried ? getErrors(values) : {};
  const changes = getChanges(values, original);

  function save() {
    if (getInvalidFields(values).length > 0) {
      setTried(true);
      return;
    }
    setOriginal(values);
    setTried(false);
    setNotice(`Cambios guardados (${changes.length}).`);
  }

  function discard() {
    setValues(original);
    setTried(false);
  }

  const fieldsProps: ClientFieldsProps = {
    values,
    errors,
    original: { ...original, id: client.id },
    onChange: (patch) => setValues((current) => ({ ...current, ...patch })),
  };

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <EditHeader
        original={original}
        initials={getInitials(values.firstName, values.lastName)}
        since={client.since}
        canSave={changes.length > 0}
      />

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

      {Object.keys(errors).length > 0 && (
        <Alert variant="danger">
          Revisa los campos marcados antes de guardar.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ContactFields {...fieldsProps} />
          <AddressFields {...fieldsProps} />
          <RoleFields {...fieldsProps} />
          <NotesField {...fieldsProps} />
        </div>
      </div>
    </form>
  );
}

function EditHeader({
  original,
  initials,
  since,
  canSave,
}: {
  original: ClientFormValues;
  initials: string;
  since?: string;
  canSave: boolean;
}) {
  const fullName = `${original.firstName} ${original.lastName}`;
  const { phonePrefix, phone, email, company, role } = original;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Operación" },
          { label: "Clientes", href: "/clients" },
          { label: fullName },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 flex-none items-center justify-center rounded-full border border-line bg-surface font-mono text-brand font-medium text-ink-soft">
            {initials}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="crm-title">Editar cliente</h1>
              {role && <RoleBadge role={role} />}
            </div>
            <span className="text-sm text-ink-muted">
              {[fullName, company, since && `cliente desde ${since}`]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${phonePrefix}${getPhoneDigits(phone)}`}
            className="crm-btn crm-btn-secondary"
            aria-label={`Llamar a ${fullName} al ${formatPhone(phonePrefix, phone)}`}
          >
            <PhoneIcon />
            Llamar
          </a>
          <a
            href={`mailto:${email}`}
            className="crm-btn crm-btn-secondary"
            aria-label={`Escribir a ${email}`}
          >
            <MailIcon />
            Correo
          </a>
          <button
            type="submit"
            className="crm-btn crm-btn-primary"
            disabled={!canSave}
          >
            <CheckIcon />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
