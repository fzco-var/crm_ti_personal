# SPEC 04 — Frontend de tickets

> **Estado:** Implementado
> **Depende de:** SPEC 02, SPEC 03
> **Fecha:** 2026-11-25
> **Objetivo:** Que el listado, el alta y la edición de tickets se puedan usar en `/tickets` y desde la edición de cliente, con datos de ejemplo y sin backend.

## Por qué existe este spec

Es el segundo módulo del MVP y el primero que se conecta con otro.

La referencia son `Tickets`, `TicketNuevo` y `TicketEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- `/tickets`: resumen por estado, búsqueda, filtros por proyecto y estado, orden, vistas "Lista" y "Por proyecto", cambio de estado con "Deshacer" y estados vacíos.
- `/tickets/new`: validaciones, datos del proyecto, avisos, posible duplicado, vista previa y "Crear y abrir otro".
- `/tickets/[id]`: cambios sin guardar, botones rápidos, resolución, espera, actividad, eliminación y panel lateral.
- Página de ticket no encontrado.
- Datos de ejemplo, ficticios, en `data/projects.ts` y `data/tickets.ts`.
- Enlace "Tickets" en el menú.
- Panel de tickets de `/clients/[id]` conectado a `data/tickets.ts`.
- Traslado del código genérico de `features/clients` a carpetas compartidas.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/`.
- Responsable del ticket.
- Pantallas de proyectos y enlaces hacia ellas.
- Menú "⋯", adjuntos y notificaciones.
- Listado de tickets filtrado por cliente.
- Estado compartido entre pantallas.

## Modelo de datos

`features/tickets/types/ticket.ts`:

```ts
export type TicketStatus = "Abierto" | "En curso" | "En espera" | "Cerrado";
export type TicketType = "Bug" | "Mejora" | "Cambio" | "Consulta";
export type TicketPriority = "Baja" | "Media" | "Alta" | "Urgente";

export interface TicketActivity {
  author: string;
  initials: string;
  isOwn: boolean; // la escribió el usuario del CRM
  action: string;
  hoursAgo: number;
  text: string; // puede ser ""
}

export interface Ticket {
  id: string; // UUID
  code: string; // "#T-1048"
  title: string;
  type: TicketType;
  description: string;
  projectId: string; // UUID de un proyecto
  requesterId: string | null; // UUID de un cliente; null es "Yo"
  status: TicketStatus;
  priority: TicketPriority;
  dueInDays: number | null; // desfase respecto a hoy
  waitingFor: string;
  activity: TicketActivity[]; // de la más reciente a la más antigua
}

// Valores editables; el alta admite `projectId` vacío.
export interface TicketFormValues {
  title: string;
  type: TicketType;
  description: string;
  projectId: string;
  requesterId: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  dueDate: string; // "2026-11-26" o ""
  waitingFor: string;
  resolution: string;
}
```

`features/projects/types/project.ts`:

```ts
export type ProjectStatus =
  "Planificado" | "En curso" | "En pausa" | "Completado";

export interface Project {
  id: string; // UUID
  code: string; // "PRJ-021"
  name: string;
  clientId: string; // contacto principal, en data/clients.ts
  status: ProjectStatus;
  endInDays: number;
}
```

Reglas:

- La última actualización es `activity[0].hoursAgo`. La apertura es la última entrada de `activity`.
- La empresa del proyecto es la de su contacto principal.
- Los contactos de un proyecto son los clientes de esa empresa, con el principal primero.
- `features/clients/types/client.ts` pierde `TicketStatus` y `Client.tickets`. Los tickets de un cliente son los que tienen su `requesterId`.

### Proyectos de ejemplo

`data/projects.ts` exporta los 8 proyectos de `TicketNuevo.dc.html`, con UUID fijos.

| Código | Contacto principal | Estado | `endInDays` |
|---|---|---|---|
| PRJ-012 | Ignacio Sepúlveda | Completado | -45 |
| PRJ-015 | Paula Navarro | Completado | -20 |
| PRJ-018 | Javiera Contreras | En curso | -3 |
| PRJ-019 | Benjamín Araya | En pausa | 30 |
| PRJ-021 | Andrea Valdés | En curso | 12 |
| PRJ-022 | Catalina Morales | En curso | 4 |
| PRJ-024 | Rodrigo Paredes | Planificado | 45 |
| PRJ-025 | Tomás Riquelme | Planificado | 60 |

### Tickets de ejemplo

`data/tickets.ts` exporta los 11 tickets de `Tickets.dc.html`, con UUID fijos.
El nombre, el tipo, el proyecto y el estado son los de esa plantilla.

| Código | Solicitante | Prioridad | `dueInDays` | Apertura (h) |
|---|---|---|---|---|
| #T-1051 | Tomás Riquelme | Media | `null` | 1 |
| #T-1050 | Catalina Morales | Alta | 2 | 3 |
| #T-1049 | Javiera Contreras | Media | `null` | 20 |
| #T-1048 | Andrea Valdés | Alta | 1 | 26 |
| #T-1046 | Javiera Contreras | Urgente | 0 | 30 |
| #T-1045 | Catalina Morales | Media | 5 | 52 |
| #T-1044 | Andrea Valdés | Baja | `null` | 75 |
| #T-1042 | Rodrigo Paredes | Alta | -2 | 96 |
| #T-1040 | Benjamín Araya | Media | 10 | 140 |
| #T-1037 | Andrea Valdés | Media | -5 | 200 |
| #T-1033 | Paula Navarro | Alta | -12 | 420 |

- #T-1048 lleva la descripción y la actividad de `TicketEditar.dc.html`.
- Los otros 10 llevan `description: ""` y una sola entrada, "abrió el ticket", del solicitante.
- Todos llevan `waitingFor: ""`.

### Tonos

| Valor | Tono |
|---|---|
| Ticket Abierto | `orange` |
| Ticket En curso, proyecto En curso | `blue` |
| Ticket En espera, proyecto En pausa | `amber` |
| Ticket Cerrado, proyecto Planificado | `gray` |
| Proyecto Completado | `green` |

Los puntos de prioridad Baja, Media, Alta y Urgente usan `--color-tone-<tono>-dot` con `gray`, `blue`, `amber` y `red`.

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Base |
|---|---|
| `code` de ticket y de proyecto | No existen |
| `title` de hasta 53 caracteres en los ejemplos | `name_ticket` admite 20 |
| `type`, `description`, `dueDate`, `waitingFor` | No existen en `tickets` |
| `requesterId` | `tickets` no se relaciona con `client` |
| `activity` y la resolución | No existen |
| Fechas como desfases | `tickets` no tiene fechas; `project.deadline` es una fecha |
| Sin responsable | `assignee_id` |
| `projectId` obligatorio | `id_project` opcional |

## Comportamiento

### Armazón y enlaces

- "Tickets" lleva a `/tickets` y tiene `aria-current="page"` en las tres pantallas.
- El código y el nombre del proyecto se muestran como texto, sin enlace.
- Los enlaces a un ticket llevan a `/tickets/<uuid>`.

### Fechas

- "Hoy" se calcula en el navegador, con su zona horaria. Durante el prerender no hay fecha.
- La edición muestra "Cargando ticket…" hasta conocer la fecha. El alta se muestra de inmediato.
- "Abierto hace" usa días y horas, sin las partes en cero: "1 día y 2 horas", "3 días", "3 horas".

### Listado

- El filtro inicial es "Sin cerrar" y el orden inicial es por estado, ascendente.
- El filtro de proyecto ofrece los 8 proyectos.
- El selector de estado cambia el ticket al instante, también a "Cerrado", sin pedir resolución.
- El aviso permite "Deshacer" solo el último cambio. Un ticket recién cambiado dice "actualizado recién".
- En "Por proyecto" el orden es el de la plantilla y todas las columnas tienen `aria-sort="none"`. Pulsar una cabecera cambia a "Lista".
- "⋯" está siempre `disabled`.
- El selector de estado mide 44 px de alto, transparente sobre la etiqueta visual de 32 px.
- El resumen usa singular cuando la cantidad es 1.

### Alta

- El código mostrado es `#T-1052`. "Crear y abrir otro" lo aumenta en 1.
- Los errores de nombre y proyecto aparecen al primer intento. El de fecha pasada aparece al momento.
- "Crear ticket" muestra el aviso y conserva los valores. No añade el ticket al listado.
- "Crear y abrir otro" conserva proyecto, solicitante y tipo, y vacía el resto.
- Al elegir un proyecto, el solicitante pasa a ser su contacto principal.
- Los avisos de proyecto y de duplicado no impiden crear.

### Alta desde un cliente

- `/tickets/new?client=<uuid>` agrupa los proyectos en "Proyectos de <empresa>" y "Otros proyectos". No elige ninguno.
- Al elegir un proyecto de su empresa, el solicitante es ese cliente.
- Un `client` ausente o desconocido deja el alta normal.

### Edición

- "Guardar cambios" está `disabled` si no hay cambios. Al guardar, los valores pasan a ser la referencia.
- Los botones rápidos solo eligen el estado; hay que guardar.
- Pasar a "Cerrado" exige una resolución de 10 caracteres o más. Queda en la actividad y el formulario sigue editable.
- Un ticket que ya estaba cerrado no pide resolución.
- `waitingFor` se edita en "En espera", cuenta como cambio "espera" y se conserva al guardar.
- Al salir de "En espera" y guardar, `waitingFor` se vacía. Si cambia el estado, la espera no cuenta como cambio aparte.
- Al cambiar de proyecto, un solicitante ajeno a su empresa pasa al contacto principal. "Yo" se conserva.
- Los campos cambiados muestran "· modificado", también el tipo.
- "Agregar nota" actúa al instante. Una nota escrita y no agregada no cuenta como cambio.
- Guardar añade a la actividad las entradas de la plantilla, a nombre de Martín Vidal.
- "Tiempo abierto" se omite si el estado guardado es "Cerrado".
- Los tickets relacionados excluyen el propio y enlazan a su edición.
- Eliminar pide confirmación en el mismo sitio. Después, el aviso "#T-1048 eliminado." enlaza a `/tickets`.
- Tras eliminar quedan `disabled` los campos, la nota y los botones rápidos, de guardar, descartar y eliminar.

### Panel de tickets del cliente

- Muestra los tickets del solicitante, en el orden de `data/tickets.ts`, y cada uno enlaza a su edición.
- "Ver todos" abre `/tickets`, sin filtro por cliente.
- "Nuevo ticket para este contacto" es un enlace a `/tickets/new?client=<uuid>`. Queda `disabled` tras eliminar el cliente.
- La zona de peligro del cliente usa el número de esos tickets.

### Estado al navegar

- Alta y edición se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda, filtros, orden, vista y estados cambiados. Su aviso con "Deshacer" se cierra al salir.
- La edición no ve los estados cambiados en el listado.

### Accesibilidad

- Tipo y prioridad son radios nativos ocultos dentro de `.crm-pill`, para usar las flechas del teclado.
- Los campos con error llevan `aria-invalid="true"` y `aria-describedby`.
- Los `id` de formularios salen de `useId`.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Mover las utilidades de texto.** `normalizeText` y `getInitials` pasan a `lib/text.ts`. Cambiar los imports de clientes.
2. **Mover los campos genéricos.** `FieldLabel`, `FieldError` y `TextField` pasan a `components/form-field.tsx`. Los tipos de clientes se quedan en su archivo.
3. **Mover los tonos.** `Tone` y `TONE_CLASSES` pasan a `components/tone.ts`, con `amber` y `red`.
4. **Crear los proyectos.** `features/projects/types/project.ts`, `features/projects/constants.ts` (tonos), `features/projects/utils.ts` (búsqueda, empresa y contactos) y `data/projects.ts`.
5. **Crear los tickets.** `features/tickets/types/ticket.ts`, `features/tickets/constants.ts` (estados, tipos, prioridades y tonos) y `data/tickets.ts`.
6. **Crear las utilidades.** `features/tickets/utils.ts`: búsqueda por ID y solicitante, textos de tiempo, fechas, validación y duplicados.
7. **Ampliar lo compartido.** Variante `warning` en `components/alert.tsx`, con `role="note"`. Iconos de lista y advertencia en `components/icons.tsx`. Estados `:has(input:checked)` y `:has(input:focus-visible)` de `.crm-pill` en `app/globals.css`.
8. **Crear la etiqueta y la ruta.** `ticket-status-badge.tsx`, `app/tickets/layout.tsx`, `app/tickets/page.tsx` con el título, y el enlace en `components/app-shell.tsx`.
9. **Crear la tabla.** `ticket-status-select.tsx` y `tickets-table.tsx`, con orden, grupos y acciones.
10. **Crear el listado.** `tickets-list.tsx`, con resumen, filtros, vistas, aviso, vacíos y pie. Conectarlo a la página.
11. **Crear los campos.** `pill-radio-group.tsx`, `status-fields.tsx` y `project-fields.tsx`. Mostrarlos en `app/tickets/new/page.tsx`.
12. **Crear el alta.** `ticket-create-form.tsx` y `ticket-preview.tsx`, con validación, avisos y reinicio al navegar.
13. **Precargar el cliente.** Leer `searchParams` dentro de `Suspense` en `app/tickets/new/page.tsx`.
14. **Crear la ruta de edición.** `app/tickets/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/tickets/[id]/not-found.tsx` en español con enlace a `/tickets`.
15. **Crear "hoy".** `features/tickets/components/use-today.ts`, con valor nulo en el servidor. Usarlo en el alta.
16. **Crear la edición.** `ticket-edit-form.tsx`, con cabecera, botones rápidos, campos, cambios sin guardar, resolución y espera.
17. **Crear la actividad.** `ticket-activity.tsx`, con notas y entradas al guardar.
18. **Crear el panel lateral.** `ticket-sidebar.tsx`, con detalles y tickets relacionados.
19. **Crear la eliminación.** `ticket-danger-zone.tsx`, con confirmación y bloqueo posterior.
20. **Conectar clientes.** Quitar `Client.tickets` y `TicketStatus` de clientes, y conectar `client-sidebar.tsx`, `client-edit-form.tsx` y `data/clients.ts`.
21. **Actualizar `CLAUDE.md`.** Añadir `/tickets`, `features/projects`, `lib/text.ts` y las piezas compartidas; quitar las notas de carpetas vacías. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 8 a 19 sin carpeta indicada van en `features/tickets/components/`.
Los pasos 4, 5, 9, 10, 11, 12 y 16 superan 50 líneas por los datos o el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `npx prettier --check app components data features lib` termina sin errores.
- [x] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [x] `prisma/` no cambia.
- [x] Ningún archivo `.tsx` nuevo contiene colores hexadecimales ni estilos `dark:`.
- [x] Ningún archivo de `features/tickets` o `features/projects` importa de `features/clients`, salvo tipos.
- [x] Todos los correos de ejemplo usan `@example.com`.
- [x] Los títulos son "Tickets — CRM TI", "Nuevo ticket — CRM TI", "Editar ticket — CRM TI" y, en un ID inexistente, "Ticket no encontrado — CRM TI".
- [x] El menú muestra 8 elementos y solo "Clientes" y "Tickets" tienen `href`.
- [x] `/tickets` muestra 9 filas, "9 sin cerrar en 6 proyectos · 11 en total" y los totales 4, 3, 2 y 2.
- [x] El pie inicial dice "Mostrando 9 de 11 tickets".
- [x] Buscar "causas" deja 2 filas; buscar "webpay" muestra "Sin resultados" con "Sin cerrar" y 1 fila con "Todos".
- [x] El proyecto PRJ-021 con "Todos" deja 3 filas.
- [x] "Por proyecto" muestra 6 grupos con "Sin cerrar" y ninguna columna ordenada; pulsar "Proyecto" vuelve a "Lista".
- [x] Cerrar #T-1050 en el listado lo quita de "Sin cerrar" y muestra "#T-1050 pasó de Abierto a Cerrado."; "Deshacer" lo restaura.
- [x] Con `tickets` vacío temporalmente se muestra "Aún no hay tickets".
- [x] "⋯" tiene `disabled` y ningún proyecto tiene enlace.
- [x] Crear el alta vacía muestra 2 errores y "Revisa los campos marcados antes de crear el ticket.".
- [x] Una fecha límite de ayer muestra "La fecha límite no puede ser anterior a hoy." sin intentar crear.
- [x] Elegir PRJ-021 muestra "Andes Logística SpA", "En curso" y 2 tickets sin cerrar, y selecciona a Andrea Valdés.
- [x] Elegir PRJ-015, PRJ-019 o PRJ-018 muestra el aviso de completado, en pausa o atrasado 3 días.
- [x] Con PRJ-021, el nombre "Descargar factura falla" advierte de #T-1048 y no impide crear.
- [x] Crear un ticket completo muestra el aviso con #T-1052; `/tickets` sigue mostrando 11 en total.
- [x] "Crear y abrir otro" conserva proyecto, solicitante y tipo, y muestra #T-1053.
- [x] Desde Rodrigo Paredes, "Nuevo ticket para este contacto" agrupa PRJ-021 y PRJ-024, y al elegir PRJ-021 el solicitante es Rodrigo.
- [x] `/tickets/new?client=x` muestra el alta normal.
- [x] Los 11 tickets abren su edición; `/tickets/not-found` muestra la página de ticket no encontrado.
- [x] #T-1048 muestra "Abierto hace 1 día y 2 horas por Andrea Valdés", "Vence mañana", 3 entradas de actividad y 2 tickets relacionados.
- [x] "Tomar" muestra "1 cambio sin guardar: estado (Abierto → En curso)"; "Descartar" lo revierte.
- [x] Cerrar sin resolución muestra el error; con 10 caracteres muestra "#T-1048 cerrado. La resolución quedó en la actividad." y añade la entrada.
- [x] En #T-1049, escribir qué se espera activa "Guardar cambios" y el texto sigue tras guardar.
- [x] Mover #T-1048 a PRJ-022 muestra el cambio de cliente y selecciona a Catalina Morales.
- [x] "Agregar nota" está `disabled` sin texto y añade la nota sin guardar el formulario.
- [x] Eliminar requiere dos pulsaciones; después todo queda deshabilitado y el aviso enlaza a `/tickets`.
- [x] La edición de Andrea Valdés muestra #T-1048, #T-1044 y #T-1037 con enlace; la de Ignacio Sepúlveda, "Sin tickets.".
- [x] "Ver todos" abre `/tickets` sin filtro de cliente.
- [x] Un borrador de alta desaparece al volver por un enlace y se conserva al volver con atrás.
- [x] El listado conserva búsqueda, filtros, vista y estados cambiados al volver; el aviso no.
- [x] Las flechas del teclado cambian tipo y prioridad.
- [x] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [x] Con Playwright, las pantallas de `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px.
- [x] Buscar, guardar, archivar y eliminar en `/clients` funcionan como en el SPEC 03.

## Decisiones

- **Sí:** tres pantallas y la conexión con clientes en un spec. Lo eligió el usuario.
- **Sí:** solo datos ficticios. Lo pidió el usuario.
- **Sí:** UUID en la URL y `code` para mostrar. Coincide con clientes y con la base.
- **No:** responsable. No está en las plantillas y el CRM es personal.
- **Sí:** `data/projects.ts` propio, con proyectos sin enlace. Servirá a su módulo y evita los 404.
- **Sí:** una sola fuente de tickets, por solicitante. El panel de Andrea tenía dos tickets inexistentes, #T-1031 y #T-0998, que se retiran.
- **Sí:** "Ver todos" sin filtro y alta con `?client=`. El filtro por cliente no está diseñado.
- **Sí:** datos mínimos en 10 tickets. Muestran todos los estados con poco código desechable.
- **Sí:** desfases de tiempo. Con fechas fijas, los ejemplos envejecerían.
- **Sí:** calcular la última actualización desde la actividad. En la plantilla, #T-1048 tenía dos valores distintos.
- **Sí:** cerrar sin resolución en el listado. Es un cambio rápido que se puede deshacer.
- **Sí:** botones rápidos que no guardan. Un solo guardado evita mezclar cambios.
- **Sí:** espera como campo guardado. La plantilla impedía guardarla en un ticket ya en espera.
- **Sí:** formulario editable tras cerrar. Permite corregir y reabrir.
- **Sí:** bloquear tras eliminar. Es la regla del SPEC 03.
- **Sí:** conservar "⋯" deshabilitado y la relación entre cabeceras y vistas de la plantilla.
- **No:** estado compartido entre pantallas. Sería código desechable, como en el SPEC 03.
- **Sí:** mover lo genérico. Evita acoplar los dominios y repetir código.
- **Sí:** 8 proyectos en el filtro. La plantilla omitía PRJ-012 solo en el listado.
- **Sí:** conservar "Yo" al mover de proyecto. La plantilla lo reemplazaba sin motivo.
- **Sí:** "Cargando ticket…" en la edición. La fecha inicial del campo depende del día del navegador.
- **Sí:** fondo de resolución y grupos con `--color-surface-muted`. Evita un token para `#FBFBF8`.
- **Sí:** radios nativos en las pills. Los botones de la plantilla no respondían a las flechas.
- **Sí:** `<title>` propio en `app/tickets/[id]/not-found.tsx` y `app/clients/[id]/not-found.tsx`. Desde la segunda visita, el 404 se sirve desde la caché sin el título de `generateMetadata` y quedaba "CRM TI". Un `not-found` de segmento no admite `metadata`. Se detectó al verificar los criterios y también corrige clientes.

Este spec reemplaza tres puntos del SPEC 03: el menú con un solo enlace, los tickets propios de cada cliente y el texto "Sin tickets." de Paula Navarro.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El build rechaza la fecha actual o `searchParams` por `cacheComponents`. | Fecha solo en el navegador y `searchParams` dentro de `Suspense`; compilar al cerrar los pasos 13, 15 y 16. |
| Mover código genérico rompe clientes. | Hacerlo en los pasos 1 a 3, sin cambios de comportamiento, y comprobar clientes al final. |
| El listado y la edición muestran estados distintos. | Es una maqueta sin estado compartido; se resuelve al conectar la base. |
| Los avisos hacen creer que los datos persisten. | No desplegarla como producto hasta conectar la base. |
| `bfcacheId` no reinicia la edición al pasar entre tickets relacionados. | Comprobarlo con los criterios de navegación antes de cerrar el paso 18. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Cambios en el esquema de la base.
- Responsable del ticket.
- Pantallas de proyectos y enlaces hacia ellas.
- Menú "⋯", adjuntos y notificaciones.
- Listado filtrado por cliente.
- Estado compartido entre pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
