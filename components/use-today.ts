"use client";

import { useSyncExternalStore } from "react";

/** Fecha local del navegador, como "2026-11-26". */
function toDateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Al volver a la pestaña, la fecha puede haber cambiado de día.
function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * "Hoy" en la zona horaria del navegador, como "2026-11-26". Es nulo en el
 * servidor y durante la hidratación: el prerender no conoce la fecha.
 */
export function useToday(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => toDateValue(new Date()),
    () => null,
  );
}
