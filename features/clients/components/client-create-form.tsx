"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckIcon } from "@/components/icons";
import { AddressFields } from "@/features/clients/components/address-fields";
import { ClientPreview } from "@/features/clients/components/client-preview";
import { ContactFields } from "@/features/clients/components/contact-fields";
import type {
  ClientFieldsProps,
  ClientFormErrors,
} from "@/features/clients/components/form-field";
import { NotesField } from "@/features/clients/components/notes-field";
import { RoleFields } from "@/features/clients/components/role-fields";
import type { ClientFormValues } from "@/features/clients/types/client";
import {
  findCompany,
  getInvalidFields,
  getPhoneDigits,
  getPhoneLengthError,
} from "@/features/clients/utils";

const EMPTY_VALUES: ClientFormValues = {
  firstName: "",
  lastName: "",
  company: "",
  phonePrefix: "+56",
  phone: "",
  email: "",
  street: "",
  unit: "",
  city: "",
  region: "",
  role: "",
  notes: "",
};

function getErrors(values: ClientFormValues): ClientFormErrors {
  const messages: ClientFormErrors = {
    firstName: "Escribe el nombre.",
    lastName: "Escribe el apellido.",
    company: "Indica la empresa del contacto.",
    phone: getPhoneDigits(values.phone)
      ? getPhoneLengthError(values.phonePrefix, values.phone)
      : "Escribe el número de teléfono.",
    email: values.email ? "Ese correo no parece válido." : "Escribe el correo.",
    street: "Escribe la calle y el número.",
    city: "Escribe la comuna o ciudad.",
    region: "Elige la región.",
    role: "Elige el rol del contacto.",
  };
  return Object.fromEntries(
    getInvalidFields(values).map((field) => [field, messages[field]]),
  );
}

/** `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás. */
export function ClientCreateForm() {
  const { bfcacheId } = useRouter();
  return <CreateForm key={bfcacheId} />;
}

function CreateForm() {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState("");

  const errors = tried ? getErrors(values) : {};
  const errorCount = Object.keys(errors).length;

  function save(createAnother: boolean) {
    if (getInvalidFields(values).length > 0) {
      setTried(true);
      setSavedText("");
      return;
    }

    const company = values.company.trim();
    const text = `${values.firstName.trim()} ${values.lastName.trim()} quedó guardado en ${company}${findCompany(company) ? "." : " (empresa nueva)."}`;
    setTried(false);

    if (createAnother) {
      const { company, phonePrefix, street, unit, city, region } = values;
      setValues({
        ...EMPTY_VALUES,
        company,
        phonePrefix,
        street,
        unit,
        city,
        region,
      });
      setSavedText(`${text} Puedes agregar otro contacto de la misma empresa.`);
    } else {
      setSavedText(text);
    }
  }

  const fieldsProps: ClientFieldsProps = {
    values,
    errors,
    onChange: (changes) => {
      setValues((current) => ({ ...current, ...changes }));
      setSavedText("");
    },
  };

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save(false);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[
              { label: "Operación" },
              { label: "Clientes", href: "/clients" },
              { label: "Nuevo cliente" },
            ]}
          />
          <h1 className="crm-title">Nuevo cliente</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/clients" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={() => save(true)}
          >
            Guardar y crear otro
          </button>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Guardar cliente
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/clients"
              className="crm-hit font-bold text-tone-green-fg underline"
            >
              Ver listado
            </Link>
          }
        >
          {savedText}
        </Alert>
      )}

      {errorCount > 0 && (
        <Alert variant="danger">
          {errorCount === 1
            ? "Falta 1 campo por revisar."
            : `Faltan ${errorCount} campos por revisar.`}
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <ContactFields {...fieldsProps} />
          <AddressFields {...fieldsProps} />
          <RoleFields {...fieldsProps} />
          <NotesField {...fieldsProps} />
        </div>
        <ClientPreview values={values} />
      </div>
    </form>
  );
}
