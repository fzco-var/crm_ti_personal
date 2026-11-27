"use client";

import { useId, useLayoutEffect, useSyncExternalStore } from "react";
import { PillRadioGroup } from "@/components/pill-radio-group";
import {
  applyAppearance,
  DARK_QUERY,
  resolveTheme,
} from "@/features/settings/appearance";
import { ACCENT_OPTIONS, THEME_OPTIONS } from "@/features/settings/constants";
import type {
  Appearance,
  ResolvedTheme,
} from "@/features/settings/types/settings";

function subscribeSystemTheme(onChange: () => void) {
  const query = matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Tema del sistema operativo; nulo en el servidor. */
function useSystemTheme(): ResolvedTheme | null {
  return useSyncExternalStore(
    subscribeSystemTheme,
    () => resolveTheme("system"),
    () => null,
  );
}

const THEME_NAMES: Record<ResolvedTheme, string> = {
  light: "claro",
  dark: "oscuro",
};

export function AppearanceSection({
  value,
  changes,
  onChange,
}: {
  value: Appearance;
  changes: { theme: boolean; accent: boolean };
  onChange: (value: Appearance) => void;
}) {
  const id = useId();
  const systemTheme = useSystemTheme();
  const { theme, accent } = value;

  // Vista previa: se aplica al elegir, y otra vez al volver con atrás
  // (Activity vuelve a montar los efectos). Guardar es cosa del formulario.
  useLayoutEffect(() => {
    applyAppearance({ theme, accent });
  }, [theme, accent]);

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-5">
      <h2 id={`${id}-heading`} className="crm-heading">
        Apariencia
      </h2>
      <div className="flex flex-col gap-2">
        <PillRadioGroup
          label="Tema"
          options={THEME_OPTIONS}
          value={theme}
          modified={changes.theme}
          onChange={(next) => onChange({ ...value, theme: next })}
        />
        {theme === "system" && systemTheme && (
          <p className="text-sm text-ink-muted">
            Ahora: {THEME_NAMES[systemTheme]}, según tu sistema.
          </p>
        )}
      </div>
      <PillRadioGroup
        label="Color de acento"
        options={ACCENT_OPTIONS}
        value={accent}
        modified={changes.accent}
        onChange={(next) => onChange({ ...value, accent: next })}
      />
    </section>
  );
}
