# SPEC 10 — Frontend del dashboard

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 03, SPEC 04, SPEC 05, SPEC 06, SPEC 09
> **Fecha:** 2026-11-27
> **Objetivo:** Que `/dashboard` sea la portada del CRM y resuma lo urgente, los indicadores, los proyectos, el ingreso por cliente, los tickets y las renovaciones, calculados de los datos de ejemplo y sin backend.

## Por qué existe este spec

"Dashboard" es el único elemento del menú que sigue sin pantalla.
Es también el primer dominio que lee de varios otros: proyectos, servicios y tickets (y, a través de ellos, clientes).
Eso rompe la regla vigente de que ningún dominio importa de `features/services`, así que este spec fija la excepción.

La referencia es `Dashboard.dc.html`, en `references/CRM-TI-templates/templates/`.
Sus textos, colores y disposición valen para todo lo que este spec no cambia.
Sus datos fijos no se copian: todo se calcula de `data/`.

## Alcance

**Incluye:**

- `/dashboard` con seis bloques: cabecera con saludo y accesos rápidos, 4 indicadores, "Necesita tu atención", "Proyectos activos", "Ingreso recurrente por cliente", "Tickets sin cerrar" y "Próximas renovaciones".
- `/` redirige a `/dashboard`.
- Enlace "Dashboard" en el menú.
- Casillas de "Necesita tu atención" como estado local, sin guardar.
- Selector de 7 o 30 días en "Próximas renovaciones", como estado local.
- Reinicio de casillas y selector al entrar por un enlace.
- Dominio nuevo `features/dashboard`.
- Icono nuevo `MoneyIcon` en `components/icons.tsx`.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/`.
- Datos de ejemplo nuevos: no hay `data/dashboard.ts`.
- Guardar las casillas de avisos resueltos en `localStorage` o entre pantallas.
- Registrar cobros o renovaciones desde el dashboard.
- Gráficos con librería, rangos de fecha o comparación con meses anteriores.
- Personalizar, ocultar o reordenar bloques.
- Actualizar el saludo cada minuto con la página abierta.
- Cambios en las pantallas de clientes, proyectos, servicios y tickets.

## Modelo de datos

Este spec no introduce datos de ejemplo.
Todo sale de `data/clients.ts`, `data/projects.ts`, `data/services.ts` y `data/tickets.ts` mediante las utilidades de cada dominio.

`features/dashboard/types/dashboard.ts`:

```ts
export type AttentionKind = "critical" | "money" | "clock"; // icono y orden de desempate
export type RenewalRange = 7 | 30;

export interface AttentionItem {
  id: string; // "project-<uuid>", "ticket-<uuid>", "charge-<uuid>-<monthsAgo>", "renewal-<uuid>"
  kind: AttentionKind;
  title: string; // "PRJ-018 · App de agenda y recordatorios"
  detail: string; // "Proyecto atrasado · Clínica Austral Sur · 2 tickets abiertos"
  href: string; // "/projects/<uuid>", "/tickets/<uuid>" o "/services/<uuid>"
  whenText: string; // "hace 3 d", "hoy", "mañana", "en 4 d", "este mes", "sin fecha"
  sortDays: number | null; // null va al final
}
```

`features/dashboard/constants.ts` exporta:

- `ATTENTION_LIMIT = 6`.
- `ATTENTION_SOON_DAYS = 7`: umbral de renovaciones manuales y de proyectos que terminan.
- `ATTENTION_KIND_ORDER`: `critical`, `money`, `clock`, para desempatar.
- `RECENT_TICKETS_LIMIT = 5`.
- `CONCENTRATION_RATIO = 0.5`.
- `RENEWAL_RANGES`: `7` y `30`, con etiquetas "7 días" y "30 días".
- `DEFAULT_RENEWAL_RANGE = 30`.
- `QUICK_ACTIONS`: Ticket (`/tickets/new`, primario), Proyecto (`/projects/new`), Cliente (`/clients/new`) y Servicio (`/services/new`).

Definiciones:

| Término | Regla |
|---|---|
| Ticket sin cerrar | `status !== "Cerrado"` |
| Ticket de prioridad alta | `priority` es `Alta` o `Urgente` |
| Ticket reciente | menor `activity[0].hoursAgo` |
| Ticket abierto hace | `activity.at(-1).hoursAgo`, con `formatHoursAgo` |
| Proyecto activo | `status !== "Completado"` |
| Proyecto atrasado | `isOverdue` de `features/projects/utils` |
| Avance de un proyecto | hitos con `done` sobre el total; 0 % sin hitos |
| Empresa | `getProjectCompany` y `getServiceCompany` |
| Ingreso mensual | `getMonthlyRevenue`; margen = ingreso − `getMonthlyCost` |
| Cobro pendiente | cargo con `paidDay === null` de un servicio no `Cancelado` |

### Reglas de "Necesita tu atención"

| Tipo | Origen | Título | Detalle | `sortDays` |
|---|---|---|---|---|
| `critical` | Proyecto atrasado | `PRJ-018 · nombre` | "Proyecto atrasado · empresa · N tickets abiertos" | `endInDays` |
| `critical` | Ticket sin cerrar de prioridad alta | `#T-1048 · título` | "Prioridad alta · PRJ-021 · abierto hace 1 día" ("Prioridad urgente" si es `Urgente`) | `dueInDays` |
| `money` | Cobro pendiente | "Cobro pendiente de $35.000" | "servicio · empresa" | `−30 × monthsAgo` |
| `clock` | Servicio `Activo` con `autoRenew` falso y `renewInDays` ≤ 7 | "Renovar servicio (manual)" | "$450.000 / mes · empresa" | `renewInDays` |
| `clock` | Proyecto `En curso` con `endInDays` de 0 a 7 | `PRJ-022 · nombre` | "Termina pronto · empresa · N hitos pendientes" | `endInDays` |

- Orden: `sortDays` ascendente, con los `null` al final. Los empates se resuelven con `ATTENTION_KIND_ORDER` y después por el orden de los datos.
- Se muestran los 6 primeros. Si hay más, debajo va "y N avisos más".
- `whenText`: negativo → "hace N d", 0 → "hoy", 1 → "mañana", mayor → "en N d". Los cobros dicen "este mes", "hace 1 mes" o "hace N meses". Un ticket sin `dueInDays` dice "sin fecha".
- El color de `whenText` es `danger` si es negativo o un cobro, `warning` de 0 a 3 días y `ink-muted` en el resto. Un aviso resuelto lo lleva siempre en `ink-muted`.
- Singulares: "1 ticket abierto", "1 hito pendiente". Sin tickets: "sin tickets abiertos".

Con los datos actuales, los 6 avisos son, en orden, PRJ-018, #T-1042, #T-1046, el cobro de $35.000, #T-1048 y #T-1050, y debajo va "y 3 avisos más".

### Diferencias con Prisma

No hay modelo propio: el dashboard solo lee.
Las diferencias de los datos que usa están en los specs 03 a 06.

## Comportamiento

### Ruta, menú y carga

- `/` redirige a `/dashboard`.
- "Dashboard" lleva a `/dashboard` y tiene `aria-current="page"` en esa pantalla.
- El título es "Dashboard — CRM TI". No hay miga de pan: la cabecera es el saludo.
- "Hoy" se calcula con `useToday` y la hora con `useCurrentHour` (`features/dashboard/use-current-hour.ts`). Este hook usa `useSyncExternalStore`, vale nulo en el servidor y se actualiza con `visibilitychange`, como `useToday`.
- La pantalla muestra "Cargando dashboard…" hasta conocer ambos.
- Las casillas y el selector se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.

### Cabecera

- Fecha larga en `font-mono`: "viernes, 27 de noviembre de 2026".
- `h1`: "Buenos días, Martín Vidal." antes de las 12, "Buenas tardes, Martín Vidal." antes de las 20 y "Buenas noches, Martín Vidal." desde las 20.
- Resumen: "Tienes N cosas que revisar. Lo más urgente está arriba." ("1 cosa"), o "Todo al día. Buen momento para avanzar en los proyectos." si no queda ningún aviso pendiente entre los visibles.
- Accesos rápidos: "Ticket" con `crm-btn crm-btn-primary` y "Proyecto", "Cliente" y "Servicio" con `crm-btn crm-btn-secondary`, todos con `PlusIcon`.

### Indicadores

Una cuadrícula de 4 `.crm-tile` enlazadas:

| Indicador | Valor | Detalle | Enlace |
|---|---|---|---|
| Ingreso recurrente mensual (`.crm-tile-dark`) | `formatCLP` del ingreso | "Margen $616.671 · 86%" | `/services` |
| Por cobrar | suma de cobros pendientes, en `tone-orange-fg` | "N cobros pendientes" o "Sin cobros pendientes" | `/services` |
| Tickets sin cerrar | cantidad | "N abiertos · M de prioridad alta" | `/tickets` |
| Proyectos activos | cantidad | "N atrasados" en `danger` y negrita, o "Ninguno atrasado" | `/projects` |

Con los datos actuales son $718.250, $35.000, 9 y 6.

### Necesita tu atención

- `.crm-card` con el `h2` "Necesita tu atención" y el resumen "N pendientes de 6" ("Todo resuelto" si están todos marcados). El 6 es la cantidad visible.
- Cada fila tiene:
  - Un `checkbox` nativo con `.crm-checkbox` y `accent-success`, con `aria-label` "Marcar como resuelto: título" o "Marcar como pendiente: título".
  - El icono del tipo: `WarningIcon` (rojo), `MoneyIcon` (naranja) o `ClockIcon` (ámbar), sobre su fondo de tono.
  - Un enlace con el título, el detalle y `whenText`.
- Marcar una casilla tacha el título, lo pasa a `ink-muted`, pone el icono en gris y baja el contador y el resumen de la cabecera.

### Proyectos activos

- `.crm-card` con el `h2` "Proyectos activos" y "Ver todos" (`/projects`).
- Todos los proyectos activos, ordenados por `endInDays` ascendente.
- Cada fila enlaza a `/projects/<uuid>`. Muestra el código, el nombre y un texto de plazo:
  - "En pausa".
  - "Atrasado N días", en `danger`.
  - "Planificado · termina en N d".
  - "Termina hoy" o "Termina en N d", en `warning` si faltan 7 días o menos.
- Debajo va una barra de avance con "N/M hitos · empresa". La barra es `danger` si está atrasado, `tone-gray-dot` si está en pausa e `ink` en el resto.

### Ingreso recurrente por cliente

- `.crm-card` con el `h2` "Ingreso recurrente por cliente" y "Pesos al mes · servicios activos".
- Una fila por empresa con ingreso mayor que 0, ordenadas de mayor a menor:
  - Empresa, monto y porcentaje del total.
  - Barra en `ink-soft` con ancho relativo al mayor (mínimo 2 %).
  - `title` "Empresa: $X al mes (N% del total) · M servicios".
- Si la primera empresa aporta el 50 % o más, se muestra un `Alert` `warning`: "**Empresa aporta el N% de tu ingreso recurrente.** Si se va, pierdes la mayor parte de tu ingreso fijo: vale la pena sumar mantenciones en otros clientes."
- Sin servicios activos: "Sin servicios activos.".

### Tickets sin cerrar

- `.crm-card` con el `h2` "Tickets sin cerrar" y "Ver todos" (`/tickets`).
- Una barra dividida por estado (Abierto, En curso, En espera), proporcional a la cantidad. Usa los colores `TONE_DOT_CLASSES` de `TICKET_STATUS_TONES` y lleva `role="img"` con `aria-label` "Tickets por estado: 4 abiertos, 3 en curso, 2 en espera".
- Debajo, la leyenda con el nombre y la cantidad de cada estado.
- Los 5 tickets sin cerrar más recientes, cada uno enlazado a `/tickets/<uuid>`: código, título truncado, "PRJ-021 · hace 1 día" y `TicketStatusBadge`.
- Sin tickets sin cerrar: "No hay tickets sin cerrar.".

### Próximas renovaciones

- `.crm-card` con el `h2` "Próximas renovaciones" y un grupo `.crm-segment` con "7 días" y "30 días" (`aria-pressed`), con 30 por defecto.
- Entran los servicios `Activo` con `renewInDays` menor o igual al rango, incluidos los vencidos, ordenados por `renewInDays` ascendente.
- Cada fila enlaza a `/services/<uuid>` y muestra:
  - Los días: "hoy", "N d" o "hace N d". Van en `danger` hasta 3 días (y vencidos) y en `warning` hasta 7.
  - El nombre y "empresa · tipo".
  - El monto como "$450.000/mes" o "$60.000/año".
  - "Automática" en `ink-muted` o "Manual · renuévala tú" en `tone-orange-fg`.
- El pie dice "8 renovaciones en 30 días · 4 manuales", con singulares.
- Sin renovaciones: "Sin renovaciones en los próximos 7 días." (o 30).

### Accesibilidad y diseño

- Cada bloque es una `section` con `aria-labelledby` y los `id` salen de `useId`.
- Los textos y colores usan tokens y clases `.crm-*`. Ningún `.tsx` lleva hexadecimales ni `dark:`, y el dashboard funciona en claro y en oscuro.
- Las tarjetas se ordenan en una cuadrícula `repeat(auto-fit, minmax(min(420px, 100%), 1fr))` y no desbordan a 390 px.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`, en particular la de `redirect`.

1. **Crear la ruta y el menú.** `app/dashboard/layout.tsx` y `app/dashboard/page.tsx` con el título, el `href` de "Dashboard" en `components/app-shell.tsx` y la redirección de `app/page.tsx` a `/dashboard`.
2. **Crear el modelo.** `features/dashboard/types/dashboard.ts` y `features/dashboard/constants.ts`.
3. **Crear las utilidades de cabecera e indicadores.** En `features/dashboard/utils.ts`: `getGreeting`, `formatLongDate`, `formatRelativeDays` y `getDashboardKpis`.
4. **Crear las utilidades de avisos.** `getAttentionItems`, con reglas, orden y límite.
5. **Crear las utilidades de listas.** `getActiveProjects`, `getRevenueByCompany`, `getTicketStatusCounts`, `getRecentTickets` y `getRenewals(range)`.
6. **Crear la pantalla y la cabecera.** `use-current-hour.ts`, `dashboard-view.tsx` (carga y `key`) y `dashboard-header.tsx`, conectados a la página.
7. **Crear los indicadores.** `dashboard-kpis.tsx`.
8. **Crear los avisos.** `MoneyIcon` en `components/icons.tsx` y `attention-list.tsx`, con casillas, contador y "y N avisos más".
9. **Crear los proyectos activos.** `active-projects.tsx`.
10. **Crear el ingreso por cliente.** `revenue-by-company.tsx`, con el aviso de concentración.
11. **Crear los tickets sin cerrar.** `open-tickets.tsx`, con la barra, la leyenda y la lista.
12. **Crear las renovaciones.** `renewals-timeline.tsx`, con el selector de rango.
13. **Actualizar `CLAUDE.md`.** Añadir `/dashboard`, la redirección de `/`, `features/dashboard` y su regla de dependencias. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 6 a 12 van en `features/dashboard/components/`.
`features/dashboard` puede importar utilidades y constantes de `features/projects`, `features/services` y `features/tickets`, y `TicketStatusBadge` de `features/tickets/components`.
Ningún dominio importa de `features/dashboard`; solo lo hace `app/dashboard`.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features lib` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` y `data/` no cambian.
- [ ] Ningún archivo `.tsx` contiene colores hexadecimales, `text-white`, `bg-white` ni estilos `dark:`.
- [ ] Ningún archivo fuera de `features/dashboard` y `app/dashboard` importa de `features/dashboard`.
- [ ] Entrar en `/` lleva a `/dashboard`.
- [ ] El título es "Dashboard — CRM TI" y "Dashboard" tiene `href` y `aria-current="page"` en el menú.
- [ ] Antes de hidratar se ve "Cargando dashboard…", sin errores de hidratación en consola.
- [ ] La cabecera muestra la fecha larga de hoy y el saludo correcto según la hora del navegador.
- [ ] Los indicadores muestran $718.250 con "Margen $616.671 · 86%", $35.000 con "1 cobro pendiente", 9 con "4 abiertos · 4 de prioridad alta" y 6 con "1 atrasado".
- [ ] Cada indicador y acceso rápido lleva a su ruta.
- [ ] "Necesita tu atención" muestra PRJ-018, #T-1042, #T-1046, el cobro de $35.000, #T-1048 y #T-1050 en ese orden, y "y 3 avisos más".
- [ ] Marcar una casilla tacha el aviso, cambia "6 pendientes de 6" a "5 pendientes de 6" y el resumen de la cabecera a "Tienes 5 cosas…".
- [ ] Marcar los 6 muestra "Todo resuelto" y "Todo al día. Buen momento para avanzar en los proyectos.".
- [ ] Ir a `/tickets` por el menú y volver por el enlace "Dashboard" desmarca las casillas; con atrás se conservan.
- [ ] "Proyectos activos" lista PRJ-018, PRJ-022, PRJ-021, PRJ-019, PRJ-024 y PRJ-025 en ese orden, y PRJ-018 dice "Atrasado 3 días" en rojo.
- [ ] "Ingreso recurrente por cliente" suma $718.250 entre sus filas, y el aviso de concentración aparece solo si la primera empresa aporta el 50 % o más.
- [ ] "Tickets sin cerrar" muestra la leyenda Abierto 4, En curso 3 y En espera 2, y 5 tickets.
- [ ] "Próximas renovaciones" muestra 8 servicios y "8 renovaciones en 30 días · 4 manuales". Con "7 días" muestra 3.
- [ ] El selector de rango son dos botones con `aria-pressed`, y Enter y Espacio cambian el rango.
- [ ] Con Playwright, `/dashboard` no tiene errores en consola ni desborda en horizontal a 1440 px y 390 px, en claro y en oscuro.
- [ ] En oscuro, el indicador de ingreso, los botones primarios y las barras se leen bien.

## Decisiones

- **Sí:** calcular todo de `data/` con las utilidades de cada dominio. Las cifras cuadran con `/services`, `/tickets` y `/projects`; lo eligió el usuario.
- **No:** copiar los datos fijos de la plantilla. Podrían no coincidir con el resto de pantallas.
- **Sí:** `/dashboard` como portada, con `/` redirigiendo ahí. Lo eligió el usuario.
- **Sí:** las seis secciones de la plantilla en un solo spec. Lo eligió el usuario; los pasos se dividen por bloque para que cada uno quede funcional.
- **Sí:** `features/dashboard` como dominio solo consumidor. Es la única excepción a "ningún otro dominio importa de `features/services`"; lo eligió el usuario.
- **No:** el código del dashboard en `app/dashboard`. Rompe la convención `features/<dominio>`.
- **Sí:** casillas de avisos como estado local, reiniciadas al entrar por un enlace. Igual que el resto del frontend sin persistencia; lo eligió el usuario.
- **No:** guardar las casillas en `localStorage`. Los avisos cambian con los datos y una marca guardada quedaría obsoleta.
- **Sí:** reglas de avisos de la plantilla, con un máximo de 6 y "y N avisos más". Lo eligió el usuario.
- **Sí:** cobros pendientes con "este mes" o "hace N meses", ordenados como −30 × meses. Un cargo solo conoce su mes; lo eligió el usuario.
- **Sí:** tickets de prioridad alta sin fecha límite al final, con "sin fecha". Lo eligió el usuario.
- **Sí:** "Por cobrar" suma todos los cobros pendientes de servicios no cancelados. Solo el mes en curso podría dar $0; lo eligió el usuario.
- **Sí:** proyectos no completados y los 5 tickets más recientes. Lo eligió el usuario.
- **Sí:** saludo según la hora del navegador, con "Cargando dashboard…" mientras tanto. Lo eligió el usuario.
- **No:** actualizar el saludo cada minuto. `useCurrentHour` se actualiza al volver a la pestaña, como `useToday`.
- **Sí:** aviso de concentración solo si un cliente aporta el 50 % o más. Lo eligió el usuario.
- **Sí:** renovaciones de servicios activos con vencidas incluidas, 30 días por defecto. Lo eligió el usuario.
- **No:** miga de pan en el dashboard. La plantilla abre con el saludo y no hay nivel superior.
- **No:** librería de gráficos. Las barras de la plantilla son `div` con tokens.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| La hora o la fecha rompen el prerender con `cacheComponents`. | Ambas se leen en el navegador con `useSyncExternalStore` y valor nulo en el servidor; compilar al cerrar el paso 6. |
| Importar de cuatro dominios crea ciclos. | Importar siempre el módulo concreto, nunca un índice; ningún dominio importa de `features/dashboard`. |
| Cambiar los datos de ejemplo desajusta los criterios con cifras fijas. | Los criterios reflejan `data/` a esta fecha; este spec no cambia `data/`. |
| Las casillas de un bloque oculto por Activity se mezclan en pruebas. | En Playwright, buscar solo elementos visibles, como en el resto de pantallas. |
| Las barras de colores no se distinguen en oscuro. | Usan los tokens `tone-*-dot`, que tienen valor oscuro desde el SPEC 09. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Datos de ejemplo nuevos.
- Guardar los avisos resueltos.
- Registrar cobros o renovaciones desde el dashboard.
- Gráficos con librería, rangos de fecha o comparaciones históricas.
- Personalizar los bloques.
- Saludo que se actualiza cada minuto.
- Cambios en otras pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
