"use client";

import { useSyncExternalStore } from "react";

// Al volver a la pestaña, la hora puede haber cambiado.
function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * Hora local del navegador, de 0 a 23. Es nula en el servidor y durante la
 * hidratación, como `useToday`: el prerender no conoce la hora.
 */
export function useCurrentHour(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => new Date().getHours(),
    () => null,
  );
}
