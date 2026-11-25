"use client";

import { useState } from "react";
import { AddressFields } from "@/features/clients/components/address-fields";
import { ContactFields } from "@/features/clients/components/contact-fields";
import type { ClientFieldsProps } from "@/features/clients/components/form-field";
import { NotesField } from "@/features/clients/components/notes-field";
import { RoleFields } from "@/features/clients/components/role-fields";
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

  const fieldsProps: ClientFieldsProps = {
    values,
    errors: {},
    onChange: (changes) => setValues((current) => ({ ...current, ...changes })),
  };

  return (
    <form
      className="crm-content"
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <h1 className="crm-title">Nuevo cliente</h1>
      <ContactFields {...fieldsProps} />
      <AddressFields {...fieldsProps} />
      <RoleFields {...fieldsProps} />
      <NotesField {...fieldsProps} />
    </form>
  );
}
