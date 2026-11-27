import {
  ACCENT_OPTIONS,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  THEME_OPTIONS,
} from "@/features/settings/constants";
import type {
  Accent,
  Appearance,
  ResolvedTheme,
  ThemeMode,
} from "@/features/settings/types/settings";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEMES = THEME_OPTIONS.map((option) => option.value);
const ACCENTS = ACCENT_OPTIONS.map((option) => option.value);

function isThemeMode(value: unknown): value is ThemeMode {
  return THEMES.includes(value as ThemeMode);
}

function isAccent(value: unknown): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/** Lo guardado en el navegador; cada campo ausente o inválido toma su valor por defecto. */
export function readAppearance(): Appearance {
  let saved: Partial<Record<keyof Appearance, unknown>> = {};
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? "null",
    );
    if (parsed && typeof parsed === "object") saved = parsed;
  } catch {
    // JSON roto o `localStorage` bloqueado: se usan los valores por defecto.
  }
  return {
    theme: isThemeMode(saved.theme) ? saved.theme : DEFAULT_APPEARANCE.theme,
    accent: isAccent(saved.accent) ? saved.accent : DEFAULT_APPEARANCE.accent,
  };
}

/** Devuelve `false` si el navegador no deja guardar. */
export function writeAppearance(appearance: Appearance): boolean {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
    return true;
  } catch {
    return false;
  }
}

/** El tema que se pinta: el elegido, o el del sistema operativo con "Sistema". */
export function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme !== "system") return theme;
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Fija los atributos de `<html>`. Mientras `data-theme-mode` sea `system`,
 * el oyente de `APPEARANCE_SCRIPT` actualiza `data-theme` con el sistema.
 */
export function applyAppearance(appearance: Appearance): void {
  const html = document.documentElement;
  html.setAttribute("data-theme-mode", appearance.theme);
  html.setAttribute("data-theme", resolveTheme(appearance.theme));
  html.setAttribute("data-accent", appearance.accent);
}

/**
 * Se ejecuta en `<head>` antes de pintar: aplica lo guardado y sigue al sistema
 * operativo con "Sistema". Repite la lógica de `readAppearance` y
 * `applyAppearance` en JavaScript plano, con las mismas constantes.
 */
export const APPEARANCE_SCRIPT = `(function () {
  var KEY = ${JSON.stringify(APPEARANCE_STORAGE_KEY)};
  var THEMES = ${JSON.stringify(THEMES)};
  var ACCENTS = ${JSON.stringify(ACCENTS)};
  var DEFAULT = ${JSON.stringify(DEFAULT_APPEARANCE)};
  var saved = {};
  try {
    var parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (parsed && typeof parsed === "object") saved = parsed;
  } catch (e) {}
  var theme = THEMES.indexOf(saved.theme) >= 0 ? saved.theme : DEFAULT.theme;
  var accent = ACCENTS.indexOf(saved.accent) >= 0 ? saved.accent : DEFAULT.accent;
  var html = document.documentElement;
  var query = window.matchMedia(${JSON.stringify(DARK_QUERY)});
  html.setAttribute("data-theme-mode", theme);
  html.setAttribute("data-theme", theme === "system" ? (query.matches ? "dark" : "light") : theme);
  html.setAttribute("data-accent", accent);
  query.addEventListener("change", function (event) {
    if (html.getAttribute("data-theme-mode") === "system") {
      html.setAttribute("data-theme", event.matches ? "dark" : "light");
    }
  });
})();`;
