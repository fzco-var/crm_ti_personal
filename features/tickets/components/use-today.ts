"use client";

import { useSyncExternalStore } from "react";
import { toDateValue } from "@/features/tickets/utils";

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
