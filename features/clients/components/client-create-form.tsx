"use client";

import { useState } from "react";
import { ContactFields } from "@/features/clients/components/contact-fields";
import type { ClientFormValues } from "@/features/clients/types/client";

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

export function ClientCreateForm() {
  const [values, setValues] = useState(EMPTY_VALUES);

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <h1 className="crm-title">Nuevo cliente</h1>
      <ContactFields
        values={values}
        errors={{}}
        onChange={(changes) =>
          setValues((current) => ({ ...current, ...changes }))
        }
      />
    </form>
  );
}
