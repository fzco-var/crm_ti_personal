"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Alert } from "@/components/alert";
import { CheckIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { defaultSettings } from "@/data/settings";
import {
  applyAppearance,
  readAppearance,
  writeAppearance,
} from "@/features/settings/appearance";
import { AppearanceSection } from "@/features/settings/components/appearance-section";
import { RegionalSection } from "@/features/settings/components/regional-section";
import { SecuritySection } from "@/features/settings/components/security-section";
import type { SettingsValues } from "@/features/settings/types/settings";
import {
  getChangeNames,
  getMinPasswordLengthError,
  getSettingsChanges,
  MIN_PASSWORD_LENGTH_ERRORS,
} from "@/features/settings/utils";

/**
 * `bfcacheId` reinicia la pantalla al entrar por un enlace, no con atrás.
 * "Hoy" y la apariencia guardada solo se conocen en el navegador.
 */
export function SettingsForm() {
  const { bfcacheId } = useRouter();
  const today = useToday();

  if (!today) {
    return (
      <p role="status" className="text-sm text-ink-muted">
        Cargando ajustes…
      </p>
    );
  }
  return <Form key={bfcacheId} today={today} />;
}

function Form({ today }: { today: string }) {
  // Solo se monta en el navegador (con `today`), así que puede leer `localStorage`.
  // Regional y Seguridad guardados viven en este estado: se pierden al recargar.
  const [saved, setSaved] = useState<SettingsValues>(() => ({
    appearance: readAppearance(),
    ...defaultSettings,
  }));
  const [values, setValues] = useState(saved);
  const [tried, setTried] = useState(false);
  const [notice, setNotice] = useState(false);

  // Al salir sin guardar (o al ocultarla Activity), vuelve lo guardado. Al
  // volver con atrás, `AppearanceSection` aplica otra vez la vista previa.
  useLayoutEffect(() => () => applyAppearance(readAppearance()), []);

  const changes = getSettingsChanges(saved, values);
  const changeNames = getChangeNames(changes);
  const dirty = changeNames.length > 0;
  const lengthErrorCode = getMinPasswordLengthError(
    values.security.minPasswordLength,
  );
  const lengthError =
    tried && lengthErrorCode
      ? MIN_PASSWORD_LENGTH_ERRORS[lengthErrorCode]
      : undefined;

  function change(patch: Partial<SettingsValues>) {
    setValues((current) => ({ ...current, ...patch }));
    setNotice(false);
  }

  function save() {
    if (lengthErrorCode) {
      setTried(true);
      return;
    }
    writeAppearance(values.appearance);
    setSaved(values);
    setTried(false);
    setNotice(true);
  }

  function discard() {
    setValues(saved);
    setTried(false);
  }

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {dirty && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
        >
          <span className="size-2 rounded-full bg-accent" />
          <span className="min-w-0 flex-[1_1_220px]">
            Cambios sin guardar: {changeNames.join(" · ")}
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
        <Alert variant="success" onClose={() => setNotice(false)}>
          Ajustes guardados.
        </Alert>
      )}

      {lengthError && (
        <Alert variant="danger">
          Revisa los campos marcados antes de guardar.
        </Alert>
      )}

      <AppearanceSection
        value={values.appearance}
        changes={changes}
        onChange={(appearance) => change({ appearance })}
      />
      <RegionalSection
        value={values.regional}
        today={today}
        changes={changes}
        onChange={(regional) => change({ regional })}
      />
      <SecuritySection
        value={values.security}
        changes={changes}
        minPasswordLengthError={lengthError}
        onChange={(security) => change({ security })}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="crm-btn crm-btn-primary"
          disabled={!dirty}
        >
          <CheckIcon />
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
