"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { TextField } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import { PasswordField } from "@/features/users/components/password-field";
import { RolePicker } from "@/features/users/components/role-picker";
import { UserPreview } from "@/features/users/components/user-preview";
import { UsernameField } from "@/features/users/components/username-field";
import type { Role } from "@/features/roles/types/role";
import { getRoleName } from "@/features/roles/utils";
import type { UserCreateValues } from "@/features/users/types/user";
import {
  type UserField,
  type UserFieldError,
  getUserFieldErrors,
  isValidPassword,
  suggestUsername,
} from "@/features/users/utils";

/** `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás. */
export function UserCreateForm({ roles }: { roles: Role[] }) {
  const { bfcacheId } = useRouter();
  return <CreateForm key={bfcacheId} roles={roles} />;
}

const EMPTY_VALUES: UserCreateValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  roleId: "",
  password: "",
  forcePasswordChange: true,
};

// Nombre y apellido solo pueden quedar vacíos.
const FIELD_MESSAGES: Record<
  UserField,
  Partial<Record<UserFieldError, string>>
> = {
  firstName: { empty: "Escribe el nombre." },
  lastName: { empty: "Escribe el apellido." },
  username: {
    empty: "Elige un nombre de usuario.",
    invalid:
      "Usa de 3 a 24 caracteres: minúsculas, números, punto o guion bajo.",
    taken: "Ese nombre de usuario ya existe.",
  },
  email: {
    empty: "Escribe el email.",
    invalid: "Ese email no parece válido.",
    taken: "Ese email ya está en uso.",
  },
};

type CreateErrors = Partial<Record<UserField | "password" | "roleId", string>>;

/** Los errores aparecen al primer intento de guardar. */
function getErrors(values: UserCreateValues): CreateErrors {
  const errors: CreateErrors = {};
  const fieldErrors = getUserFieldErrors(values);
  for (const field of Object.keys(fieldErrors) as UserField[]) {
    const error = fieldErrors[field];
    if (error) errors[field] = FIELD_MESSAGES[field][error];
  }
  if (!values.password) {
    errors.password = "Escribe o genera una contraseña.";
  } else if (!isValidPassword(values.password)) {
    errors.password = `Tiene ${values.password.length} caracteres; necesita al menos 12.`;
  }
  if (!values.roleId) errors.roleId = "Elige un rol para el usuario.";
  return errors;
}

function CreateForm({ roles }: { roles: Role[] }) {
  const id = useId();
  const [values, setValues] = useState(EMPTY_VALUES);
  // El usuario se sugiere a partir del nombre hasta que se edita el campo.
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState("");

  const effective: UserCreateValues = usernameEdited
    ? values
    : {
        ...values,
        username: suggestUsername(values.firstName, values.lastName),
      };
  const allErrors = getErrors(effective);
  const isValid = Object.keys(allErrors).length === 0;
  const errors = tried ? allErrors : {};

  function change(changes: Partial<UserCreateValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setSavedText("");
  }

  /** Sin persistencia: muestra el aviso, conserva los valores y no añade el usuario. */
  function save() {
    // La sugerencia solo se detiene al editar el campo, no al guardar.
    setTried(true);
    setSavedText(
      isValid
        ? `Usuario @${effective.username} creado con el rol ${getRoleName(effective.roleId)}.`
        : "",
    );
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[
              { label: "Configuración" },
              { label: "Usuarios", href: "/users" },
              { label: "Nuevo usuario" },
            ]}
          />
          <h1 className="crm-title">Nuevo usuario</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/users" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Crear usuario
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/users"
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
          Revisa los campos marcados antes de crear el usuario.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <section aria-labelledby={`${id}-data`} className="crm-card gap-5">
            <div className="flex flex-col gap-1">
              <h2 id={`${id}-data`} className="crm-heading">
                Datos de la persona
              </h2>
              <p className="text-sm text-ink-muted">
                Así aparecerá en el listado y en los tickets que gestione.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
              <TextField
                label="Nombre"
                placeholder="Ej. Camila"
                value={values.firstName}
                error={errors.firstName}
                onChange={(event) => change({ firstName: event.target.value })}
              />
              <TextField
                label="Apellido"
                placeholder="Ej. Rojas"
                value={values.lastName}
                error={errors.lastName}
                onChange={(event) => change({ lastName: event.target.value })}
              />
            </div>
          </section>

          <section aria-labelledby={`${id}-account`} className="crm-card gap-5">
            <div className="flex flex-col gap-1">
              <h2 id={`${id}-account`} className="crm-heading">
                Cuenta de acceso
              </h2>
              <p className="text-sm text-ink-muted">
                Con esto iniciará sesión en el CRM.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
              <UsernameField
                value={effective.username}
                error={errors.username}
                onChange={(username) => {
                  setUsernameEdited(true);
                  change({ username });
                }}
              >
                {!errors.username && (
                  <span className="text-compact text-ink-muted">
                    Se sugiere a partir del nombre. Solo minúsculas, números,
                    punto o guion bajo.
                  </span>
                )}
              </UsernameField>
              <TextField
                label="Email"
                type="email"
                placeholder="nombre@empresa.com"
                value={values.email}
                error={errors.email}
                onChange={(event) =>
                  change({ email: event.target.value.trim() })
                }
              />
            </div>

            <PasswordField
              label="Contraseña inicial"
              hint="Mínimo 12 caracteres"
              revealable
              value={values.password}
              error={errors.password}
              onChange={(password) => change({ password })}
            >
              <label
                htmlFor={`${id}-force`}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  id={`${id}-force`}
                  type="checkbox"
                  className="crm-checkbox"
                  checked={values.forcePasswordChange}
                  onChange={(event) =>
                    change({ forcePasswordChange: event.target.checked })
                  }
                />
                Pedir que la cambie en su primer inicio de sesión
              </label>
            </PasswordField>
          </section>

          <RolePicker
            roles={roles}
            value={values.roleId}
            error={errors.roleId}
            legend="Elige un rol"
            adminWarning
            onChange={(roleId) => change({ roleId })}
          />
        </div>
        <UserPreview values={effective} />
      </div>
    </form>
  );
}
