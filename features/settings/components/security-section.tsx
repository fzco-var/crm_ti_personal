"use client";

import { useId } from "react";
import { Alert } from "@/components/alert";
import { TextField } from "@/components/form-field";
import { PillRadioGroup } from "@/components/pill-radio-group";
import {
  IDLE_TIMEOUT_OPTIONS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/features/settings/constants";
import type {
  IdleTimeout,
  SecuritySettings,
} from "@/features/settings/types/settings";

// `PillRadioGroup` trabaja con texto: los minutos se pasan como "30" y vuelven a número.
const IDLE_TIMEOUT_PILLS = IDLE_TIMEOUT_OPTIONS.map((option) => ({
  value: String(option.value),
  label: option.label,
}));

export function SecuritySection({
  value,
  changes,
  minPasswordLengthError,
  onChange,
}: {
  value: SecuritySettings;
  changes: {
    requireTwoFactor: boolean;
    minPasswordLength: boolean;
    idleTimeoutMinutes: boolean;
  };
  /** Texto del error, tras el primer intento de guardar. */
  minPasswordLengthError?: string;
  onChange: (value: SecuritySettings) => void;
}) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-heading`} className="crm-heading">
          Seguridad
        </h2>
        <p className="text-sm text-ink-muted">
          Estas políticas se aplicarán cuando exista el inicio de sesión.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="crm-label">
          <input
            type="checkbox"
            className="crm-checkbox"
            checked={value.requireTwoFactor}
            onChange={(event) =>
              onChange({ ...value, requireTwoFactor: event.target.checked })
            }
          />
          <span>
            Exigir 2FA a todos los usuarios
            {changes.requireTwoFactor && (
              <span className="text-xs font-bold text-accent">
                {" "}
                · modificada
              </span>
            )}
          </span>
        </label>
        {!value.requireTwoFactor && (
          <Alert variant="warning">
            Sin 2FA obligatoria, una contraseña filtrada basta para entrar al
            CRM.
          </Alert>
        )}
      </div>

      <div className="max-w-xs">
        <TextField
          label="Largo mínimo de contraseña"
          inputMode="numeric"
          value={value.minPasswordLength}
          modified={changes.minPasswordLength}
          error={minPasswordLengthError}
          onChange={(event) =>
            onChange({ ...value, minPasswordLength: event.target.value })
          }
        >
          <span className="text-sm text-ink-muted">
            Entre {MIN_PASSWORD_LENGTH} y {MAX_PASSWORD_LENGTH} caracteres.
          </span>
        </TextField>
      </div>

      <PillRadioGroup
        label="Cierre por inactividad"
        options={IDLE_TIMEOUT_PILLS}
        value={String(value.idleTimeoutMinutes)}
        modified={changes.idleTimeoutMinutes}
        onChange={(minutes) =>
          onChange({
            ...value,
            idleTimeoutMinutes: Number(minutes) as IdleTimeout,
          })
        }
      />
    </section>
  );
}
