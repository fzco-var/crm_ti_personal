"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { TextField } from "@/components/form-field";
import { CheckIcon, KeyIcon, MailIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { PasswordField } from "@/features/users/components/password-field";
import { RolePicker } from "@/features/users/components/role-picker";
import { UserDangerZone } from "@/features/users/components/user-danger-zone";
import { UserSecurity } from "@/features/users/components/user-security";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import { UsernameField } from "@/features/users/components/username-field";
import { CURRENT_USER_ID } from "@/features/users/constants";
import type { Role } from "@/features/roles/types/role";
import type { User, UserFormValues } from "@/features/users/types/user";
import {
  type UserField,
  type UserFieldError,
  formatLastAccess,
  formatPasswordAge,
  getFullName,
  getRoleName,
  getUserFieldErrors,
  isValidPassword,
} from "@/features/users/utils";
import { addDays, formatDate } from "@/features/tickets/utils";
import { getInitials } from "@/lib/text";

type ChangeKey = keyof UserFormValues;

// En el orden en que se listan los cambios sin guardar.
const CHANGE_LABELS: [ChangeKey, string][] = [
  ["firstName", "nombre"],
  ["lastName", "apellido"],
  ["username", "usuario"],
  ["email", "email"],
  ["roleId", "rol"],
];

// Mensajes de la plantilla de edición, más los de repetidos del alta.
const FIELD_MESSAGES: Record<
  UserField,
  Partial<Record<UserFieldError, string>>
> = {
  firstName: { empty: "El nombre no puede quedar vacío." },
  lastName: { empty: "El apellido no puede quedar vacío." },
  username: {
    empty: "De 3 a 24 caracteres: minúsculas, números, punto o guion bajo.",
    invalid: "De 3 a 24 caracteres: minúsculas, números, punto o guion bajo.",
    taken: "Ese nombre de usuario ya existe.",
  },
  email: {
    empty: "Ese email no parece válido.",
    invalid: "Ese email no parece válido.",
    taken: "Ese email ya está en uso.",
  },
};

type EditErrors = Partial<Record<UserField | "tempPassword", string>>;

function toFormValues(user: User): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
  };
}

function getChanges(
  values: UserFormValues,
  original: UserFormValues,
  hasTempPassword: boolean,
) {
  const changes = CHANGE_LABELS.filter(
    ([key]) => values[key] !== original[key],
  ).map(([key, label]) =>
    key === "roleId"
      ? `rol (${getRoleName(original.roleId)} → ${getRoleName(values.roleId)})`
      : label,
  );
  return hasTempPassword ? [...changes, "contraseña temporal"] : changes;
}

/** Una contraseña temporal vacía no cuenta; con menos de 12 caracteres, impide guardar. */
function getErrors(
  values: UserFormValues,
  userId: string,
  tempPassword: string,
): EditErrors {
  const errors: EditErrors = {};
  const fieldErrors = getUserFieldErrors(values, userId);
  for (const field of Object.keys(fieldErrors) as UserField[]) {
    const error = fieldErrors[field];
    if (error) errors[field] = FIELD_MESSAGES[field][error];
  }
  if (tempPassword && !isValidPassword(tempPassword)) {
    errors.tempPassword = "Necesita al menos 12 caracteres.";
  }
  return errors;
}

/**
 * `bfcacheId` reinicia la edición al entrar por un enlace, no con atrás.
 * Las fechas dependen del día del navegador: sin él, no hay formulario.
 */
export function UserEditForm({ user, roles }: { user: User; roles: Role[] }) {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando usuario…
        </p>
      </div>
    );
  }
  return <EditForm key={bfcacheId} user={user} roles={roles} today={today} />;
}

function EditForm({
  user,
  roles,
  today,
}: {
  user: User;
  roles: Role[];
  today: string;
}) {
  const id = useId();
  // El usuario guardado. Las acciones inmediatas lo cambian sin pasar por "Guardar".
  const [account, setAccount] = useState(user);
  const original = toFormValues(account);
  const [values, setValues] = useState(original);
  const [tempOpen, setTempOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleted, setDeleted] = useState(false);

  const isCurrentUser = account.id === CURRENT_USER_ID;
  const activeTempPassword = tempOpen ? tempPassword : "";
  const changes = getChanges(values, original, Boolean(activeTempPassword));
  const allErrors = getErrors(values, account.id, activeTempPassword);
  const isValid = Object.keys(allErrors).length === 0;
  const errors = tried ? allErrors : {};
  const fullName = getFullName(account);

  function change(patch: Partial<UserFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function closeTempPassword() {
    setTempOpen(false);
    setTempPassword("");
  }

  function save() {
    if (!isValid) {
      setTried(true);
      return;
    }
    // Con contraseña temporal, pasa a temporal "hoy" y se cierran las sesiones.
    setAccount({
      ...account,
      ...values,
      ...(activeTempPassword && {
        passwordTemporary: true,
        passwordChangedDaysAgo: 0,
        sessions: [],
      }),
    });
    setNotice(`Cambios guardados (${changes.length}).`);
    closeTempPassword();
    setTried(false);
  }

  function discard() {
    setValues(original);
    closeTempPassword();
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
            { label: "Configuración" },
            { label: "Usuarios", href: "/users" },
            { label: fullName },
          ]}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-14 flex-none items-center justify-center rounded-full border border-line bg-surface font-mono text-brand font-medium text-ink-soft">
              {getInitials(values.firstName, values.lastName)}
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">
                  Editar usuario
                </h1>
                <UserStatusBadge active={account.active} />
              </div>
              <span className="text-sm text-ink-muted">
                {fullName} ·{" "}
                <span className="font-mono">@{account.username}</span> · creado
                el {formatDate(addDays(today, -account.createdDaysAgo))} ·
                último acceso{" "}
                {formatLastAccess(today, account.lastAccessDaysAgo)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/users" className="crm-btn crm-btn-secondary">
              Volver
            </Link>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={changes.length === 0 || deleted}
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
            disabled={deleted}
            onClick={discard}
          >
            Descartar
          </button>
        </div>
      )}

      {notice && (
        <Alert
          variant="success"
          action={
            deleted && (
              <Link
                href="/users"
                className="crm-hit font-bold text-tone-green-fg underline"
              >
                Ver listado
              </Link>
            )
          }
          onClose={deleted ? undefined : () => setNotice("")}
        >
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
          <section aria-labelledby={`${id}-data`} className="crm-card gap-5">
            <h2 id={`${id}-data`} className="crm-heading">
              Datos y cuenta
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-5">
              <TextField
                label="Nombre"
                value={values.firstName}
                error={errors.firstName}
                modified={values.firstName !== original.firstName}
                disabled={deleted}
                onChange={(event) => change({ firstName: event.target.value })}
              />
              <TextField
                label="Apellido"
                value={values.lastName}
                error={errors.lastName}
                modified={values.lastName !== original.lastName}
                disabled={deleted}
                onChange={(event) => change({ lastName: event.target.value })}
              />
              <UsernameField
                value={values.username}
                error={errors.username}
                modified={values.username !== original.username}
                disabled={deleted}
                onChange={(username) => change({ username })}
              >
                {values.username !== original.username && (
                  <span className="text-compact text-ink-muted">
                    Deberá entrar con el nuevo nombre de usuario.
                  </span>
                )}
              </UsernameField>
              <TextField
                label="Email"
                type="email"
                value={values.email}
                error={errors.email}
                modified={values.email !== original.email}
                disabled={deleted}
                onChange={(event) =>
                  change({ email: event.target.value.trim() })
                }
              >
                {values.email !== original.email && (
                  <span className="text-compact text-ink-muted">
                    Enviaremos un enlace de confirmación al email nuevo.
                  </span>
                )}
              </TextField>
            </div>
          </section>

          <section
            aria-labelledby={`${id}-password`}
            className="crm-card gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 id={`${id}-password`} className="crm-heading">
                  Contraseña
                </h2>
                <p className="text-sm text-ink-muted">
                  {account.passwordTemporary
                    ? "Temporal, aún sin cambiar."
                    : `Cambiada ${formatPasswordAge(account.passwordChangedDaysAgo)}. Por seguridad no se puede ver.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary h-10 px-3.5 text-compact"
                  disabled={!account.active || deleted}
                  onClick={() =>
                    setNotice(
                      `Enviamos un enlace para restablecer la contraseña a ${account.email}.`,
                    )
                  }
                >
                  <MailIcon size={15} />
                  Enviar enlace de restablecimiento
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary h-10 px-3.5 text-compact"
                  aria-expanded={tempOpen}
                  disabled={deleted}
                  onClick={() =>
                    tempOpen ? closeTempPassword() : setTempOpen(true)
                  }
                >
                  <KeyIcon />
                  {tempOpen
                    ? "Cancelar contraseña temporal"
                    : "Definir contraseña temporal"}
                </button>
              </div>
            </div>
            {tempOpen && (
              <div className="rounded-xl border border-line bg-surface-muted p-4">
                <PasswordField
                  label="Contraseña temporal"
                  placeholder="Mínimo 12 caracteres"
                  emptyLabel="Escribe o genera una"
                  value={tempPassword}
                  error={errors.tempPassword}
                  disabled={deleted}
                  onChange={setTempPassword}
                >
                  <span className="text-compact text-ink-muted">
                    Se le pedirá cambiarla en su próximo inicio de sesión y se
                    cerrarán sus sesiones abiertas.
                  </span>
                </PasswordField>
              </div>
            )}
          </section>

          <RolePicker
            roles={roles}
            value={values.roleId}
            savedRoleId={original.roleId}
            legend="Rol del usuario"
            disabled={isCurrentUser || deleted}
            onChange={(roleId) => change({ roleId })}
          >
            {isCurrentUser && (
              <p className="text-compact text-ink-muted">
                Es tu cuenta: no puedes cambiar tu rol, desactivarla ni
                eliminarla.
              </p>
            )}
          </RolePicker>

          <UserDangerZone
            active={account.active}
            username={account.username}
            isCurrentUser={isCurrentUser}
            disabled={deleted}
            onToggleActive={() => {
              // Desactivar cierra las sesiones; reactivar no las recupera.
              setAccount(
                account.active
                  ? { ...account, active: false, sessions: [] }
                  : { ...account, active: true },
              );
              setNotice(
                account.active
                  ? "Cuenta desactivada y sesiones cerradas."
                  : "Cuenta reactivada.",
              );
            }}
            onDelete={() => {
              // Sin persistencia: bloquea la pantalla y enlaza al listado.
              setDeleted(true);
              setNotice(`Usuario @${account.username} eliminado.`);
            }}
          />
        </div>
        <UserSecurity
          account={account}
          today={today}
          disabled={deleted}
          onResetTwoFactor={() => {
            setAccount({ ...account, twoFactorActive: false });
            setNotice(
              "2FA restablecida. Tendrá que configurarla de nuevo al entrar.",
            );
          }}
          onCloseSessions={() => {
            setAccount({ ...account, sessions: [] });
            setNotice(
              `Se cerraron todas las sesiones de @${account.username}.`,
            );
          }}
        />
      </div>
    </form>
  );
}
