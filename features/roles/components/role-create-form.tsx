"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { FieldLabel, TextField } from "@/components/form-field";
import { CheckIcon } from "@/components/icons";
import { PermissionMatrix } from "@/features/roles/components/permission-matrix";
import { PermissionPresets } from "@/features/roles/components/permission-presets";
import { RoleSummary } from "@/features/roles/components/role-summary";
import type { RoleFormValues } from "@/features/roles/types/role";
import {
  type RoleKeyError,
  type RoleNameError,
  generateRoleKey,
  getPresetPermissions,
  getRoleKeyError,
  getRoleNameError,
  hasCriticalPermission,
} from "@/features/roles/utils";

/** `bfcacheId` reinicia el alta al entrar por un enlace, no con atrás. */
export function RoleCreateForm() {
  const { bfcacheId } = useRouter();
  return <CreateForm key={bfcacheId} />;
}

const EMPTY_VALUES: RoleFormValues = {
  name: "",
  description: "",
  permissions: [],
};

const NAME_MESSAGES: Record<RoleNameError, string> = {
  empty: "Ponle un nombre al rol.",
  tooLong: "Usa 20 caracteres o menos.",
  taken: "Ya existe un rol con ese nombre.",
};

/** Un solo error, en el orden de prioridad del nombre y luego de la clave. */
function getNameError(name: string, key: string) {
  const nameError = getRoleNameError(name);
  if (nameError) return NAME_MESSAGES[nameError];
  const keyError: RoleKeyError | undefined = getRoleKeyError(key);
  if (keyError === "empty") {
    return "El nombre necesita al menos una letra o un número.";
  }
  if (keyError === "taken") return `Ya existe un rol con la clave ${key}.`;
  return undefined;
}

function CreateForm() {
  const id = useId();
  const [values, setValues] = useState(EMPTY_VALUES);
  // `null` cuando se toca la matriz: ninguna plantilla queda pulsada.
  const [presetId, setPresetId] = useState<string | null>("en_blanco");
  const [tried, setTried] = useState(false);
  const [savedText, setSavedText] = useState<{
    name: string;
    count: number;
  } | null>(null);

  const key = generateRoleKey(values.name);
  const nameError = getNameError(values.name, key);

  function change(changes: Partial<RoleFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setSavedText(null);
  }

  /** Sin persistencia: muestra el aviso, conserva los valores y no añade el rol. */
  function save() {
    setTried(true);
    setSavedText(
      nameError
        ? null
        : { name: values.name.trim(), count: values.permissions.length },
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
              { label: "Roles y permisos", href: "/roles" },
              { label: "Nuevo rol" },
            ]}
          />
          <h1 className="crm-title">Crear rol</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/roles" className="crm-btn crm-btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="crm-btn crm-btn-primary">
            <CheckIcon />
            Guardar rol
          </button>
        </div>
      </div>

      {savedText && (
        <Alert
          variant="success"
          action={
            <Link
              href="/roles"
              className="crm-hit font-bold text-tone-green-fg underline"
            >
              Ver listado
            </Link>
          }
        >
          Rol <strong>{savedText.name}</strong> creado con {savedText.count}{" "}
          permisos.
        </Alert>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <section aria-labelledby={`${id}-data`} className="crm-card gap-5">
            <div className="flex flex-col gap-1">
              <h2 id={`${id}-data`} className="crm-heading">
                Datos del rol
              </h2>
              <p className="text-sm text-ink-muted">
                Cómo se llama y para qué sirve.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
              <TextField
                label="Nombre del rol"
                placeholder="Ej. Técnico de soporte"
                value={values.name}
                error={tried ? nameError : undefined}
                onChange={(event) => change({ name: event.target.value })}
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="crm-label">Clave interna</span>
                <span className="flex h-[46px] items-center overflow-hidden rounded-control border border-line bg-surface-muted px-3.5 font-mono text-sm text-ink-soft">
                  <span className="truncate">
                    {values.name ? key : "se_genera_del_nombre"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={`${id}-description`}>
                Descripción{" "}
                <span className="font-medium text-ink-muted">(opcional)</span>
              </FieldLabel>
              <textarea
                id={`${id}-description`}
                rows={3}
                className="crm-textarea"
                placeholder="Qué puede hacer quien tenga este rol."
                value={values.description}
                onChange={(event) =>
                  change({ description: event.target.value })
                }
              />
            </div>
          </section>

          <section aria-labelledby={`${id}-permissions`} className="crm-card">
            <div className="flex flex-col gap-1">
              <h2 id={`${id}-permissions`} className="crm-heading">
                Permisos
              </h2>
              <p className="text-sm text-ink-muted">
                Parte de una plantilla y ajusta lo que necesites.
              </p>
            </div>
            <PermissionPresets
              value={presetId}
              onPick={(preset) => {
                setPresetId(preset);
                change({ permissions: getPresetPermissions(preset) });
              }}
            />
            <PermissionMatrix
              permissions={values.permissions}
              onChange={(permissions) => {
                setPresetId(null);
                change({ permissions });
              }}
            />
            {hasCriticalPermission(values.permissions) && (
              <Alert variant="warning">
                Este rol podrá modificar usuarios y roles, incluido el suyo.
                Dalo solo a cuentas de máxima confianza.
              </Alert>
            )}
          </section>
        </div>
        <RoleSummary name={values.name} permissions={values.permissions} />
      </div>
    </form>
  );
}
