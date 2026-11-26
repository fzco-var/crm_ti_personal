# SPEC 05 — Frontend de proyectos

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 03, SPEC 04
> **Fecha:** 2026-11-26
> **Objetivo:** Que el listado, el alta y la edición de proyectos se puedan usar en `/projects`, enlazados desde los tickets, con datos de ejemplo y sin backend.

## Por qué existe este spec

Es el tercer módulo del MVP.
El SPEC 04 creó `data/projects.ts` y dejó los proyectos como texto sin enlace hasta tener sus pantallas.

La referencia son `Proyectos`, `ProyectoNuevo` y `ProyectoEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- `/projects`: resumen, búsqueda, filtro por estado, "Solo atrasados", orden y estados vacíos.
- `/projects/new`: validaciones, cliente, estado inicial, prioridad, fechas, duración rápida, hitos y vista previa.
- `/projects/[id]`: cambios sin guardar, estado y prioridad, fechas con motivo, hitos, avance, tickets, historial, archivado y eliminación.
- Página de proyecto no encontrado.
- Ampliación de `Project` y de `data/projects.ts`.
- Enlace "Proyectos" en el menú.
- Enlaces a `/projects/<uuid>` desde las pantallas de tickets.
- `/tickets?project=<uuid>`, que abre el listado filtrado por ese proyecto.
- Traslado de `pill-radio-group.tsx` y `use-today.ts` a `components/`.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/`.
- Panel de proyectos en `/clients/[id]`.
- Alta de proyecto desde un cliente (`?client=`) y alta de ticket desde un proyecto.
- Menú "⋯".
- Nombre de proyecto único.
- Estado compartido entre pantallas, incluido ocultar los archivados del listado.

## Modelo de datos

`features/projects/types/project.ts` pasa a ser:

```ts
export type ProjectStatus =
  "Planificado" | "En curso" | "En pausa" | "Completado";
export type ProjectPriority = "Baja" | "Media" | "Alta";

export interface ProjectMilestone {
  name: string;
  dueInDays: number; // desfase respecto a hoy
  done: boolean;
}

export interface ProjectHistoryEntry {
  text: string; // "Hito «MVP» completado"
  daysAgo: number; // 0 se muestra como "ahora"
}

export interface Project {
  id: string; // UUID
  code: string; // "PRJ-021"
  name: string;
  clientId: string; // contacto principal, en data/clients.ts
  description: string; // puede ser ""
  status: ProjectStatus;
  priority: ProjectPriority;
  startInDays: number; // desfase respecto a hoy
  endInDays: number;
  createdDaysAgo: number;
  milestones: ProjectMilestone[]; // en orden de fecha
  history: ProjectHistoryEntry[]; // de la más reciente a la más antigua
}

export interface MilestoneFormValues {
  key: string; // estable mientras se edita
  name: string;
  date: string; // "2026-11-26" o ""
  done: boolean;
}

// Valores editables; el alta admite `clientId` y `endDate` vacíos.
export interface ProjectFormValues {
  name: string;
  clientId: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  milestones: MilestoneFormValues[];
}
```

El motivo del cambio de término es un estado aparte de la edición. No forma parte de `ProjectFormValues` ni cuenta como cambio.

Reglas:

- La empresa del proyecto sigue siendo la de su contacto principal.
- Los tickets de un proyecto son los de `data/tickets.ts` con su `projectId`, en ese orden.
- Un proyecto está atrasado si no está "Completado" y `endInDays < 0`.
- Un proyecto vence pronto si no está "Completado" y `endInDays` está entre 0 y 7.
- Los proyectos de un contacto son los que tienen su `clientId`.

### Proyectos de ejemplo

`data/projects.ts` conserva los 8 proyectos, sus UUID, nombres, contactos, estados y `endInDays`, y añade:

| Código | Prioridad | `startInDays` | `createdDaysAgo` |
|---|---|---|---|
| PRJ-012 | Media | -120 | 130 |
| PRJ-015 | Media | -90 | 100 |
| PRJ-018 | Alta | -60 | 70 |
| PRJ-019 | Baja | -40 | 50 |
| PRJ-021 | Alta | -30 | 45 |
| PRJ-022 | Alta | -50 | 60 |
| PRJ-024 | Media | 7 | 5 |
| PRJ-025 | Baja | 14 | 2 |

- PRJ-021 lleva la descripción de `ProyectoEditar.dc.html`.
- PRJ-021 lleva sus 4 hitos, con `dueInDays` -24, -10, -2 y 10. Los dos primeros están hechos.
- El historial de PRJ-021 tiene 3 entradas, con `daysAgo` 10, 24 y 45. Los textos son los de la plantilla, sin la fecha.
- Los otros 7 llevan `description: ""`, `milestones: []` y una sola entrada: "Proyecto creado por Martín Vidal", con `daysAgo` igual a `createdDaysAgo`.

### Tonos

Los estados conservan `PROJECT_STATUS_TONES`.
Los puntos de prioridad Baja, Media y Alta usan `--color-tone-<tono>-dot` con `gray`, `blue` y `red`.

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Modelo `project` |
|---|---|
| `code` | No existe |
| `priority`, `milestones`, `history` y archivado | No existen |
| Fechas como desfases | `initial_date` y `deadline` son fechas; `created_at` es un timestamp |
| `status`, de 4 valores | `state` es texto libre de 20 caracteres |
| `description` sin límite | `description` admite 255 |
| `name` sin límite ni unicidad | `name_project` admite 40 y es `@unique` |
| `clientId` obligatorio | `id_client` opcional |

## Comportamiento

### Armazón y enlaces

- "Proyectos" lleva a `/projects` y tiene `aria-current="page"` en las tres pantallas.
- Los enlaces a un proyecto llevan a `/projects/<uuid>`. Los del cliente, a `/clients/<uuid>`.
- En tickets, el código o el nombre del proyecto pasa a ser enlace en la tabla, en la cabecera de cada grupo de "Por proyecto", en la ficha del proyecto del alta y la edición, y en el panel lateral.
- "¿No está? Crear un cliente nuevo" lleva a `/clients/new`.

### Fechas

- "Hoy" se calcula en el navegador con `useToday`, ya en `components/use-today.ts`.
- El alta y la edición muestran "Cargando proyecto…" hasta conocer la fecha.
- Las fechas se muestran con `es-CL`, como `26 nov 2026`.

### Listado

- El orden inicial es por fecha de término, ascendente. Se ordena por nombre, cliente, estado y fecha de término.
- El orden por estado es En curso, Planificado, En pausa y Completado.
- La búsqueda cubre nombre, código, contacto y empresa, sin distinguir mayúsculas ni tildes.
- "Solo atrasados" se combina con la búsqueda y el filtro de estado.
- El texto relativo es "Terminado", "Vence hoy", "Atrasado N días" o "En N días", en singular con 1.
- Atrasados y próximos a vencer llevan el icono de advertencia y su color de la plantilla.
- "⋯" está siempre `disabled`.
- El resumen usa singular cuando la cantidad es 1.

### Alta

- El código mostrado es `PRJ-026`.
- El inicio empieza en hoy. El estado inicial es "Planificado" y la prioridad "Media".
- El estado inicial solo ofrece Planificado, En curso y En pausa.
- Los errores de nombre, cliente, inicio y término aparecen al primer intento. El de término anterior al inicio aparece al momento.
- Un hito con fecha fuera del rango muestra "Fuera del rango del proyecto." e impide crear.
- Al elegir un cliente se muestra "<empresa> · <rol> · N proyecto(s) con este contacto", con el número real.
- La duración y el aviso de fin de semana son los de la plantilla.
- "Crear proyecto" muestra el aviso de la plantilla y conserva los valores. No añade el proyecto al listado.

### Edición

- La cabecera muestra la etiqueta del estado guardado y "creado el <fecha>", calculada con `createdDaysAgo`.
- "Guardar cambios" está `disabled` si no hay cambios. Al guardar, los valores pasan a ser la referencia.
- Los cambios cuentan por nombre, cliente, descripción, estado, prioridad, fechas e hitos. El estado se muestra como "estado (En curso → Completado)".
- Los campos y secciones cambiados muestran "· modificado" o "· modificadas".
- Nombre, inicio y término son obligatorios. Un hito fuera del rango impide guardar.
- Cambiar a un cliente de otra empresa muestra "Pasará de <empresa> a <empresa>.".
- Marcar "Completado" con hitos pendientes muestra el aviso y "Marcar todos como hechos".
- "Mover término" ofrece +1 semana, +2 semanas, +1 mes y Hoy.
- Un término distinto del guardado muestra la caja con la fecha anterior, la nueva, la diferencia y el motivo.
- Un hito no hecho con fecha pasada muestra "Vencido hace N días", en singular con 1.
- Guardar añade al historial el cambio de estado y el de término, con su motivo si lo hay. Ambos muestran "ahora".
- "Avance" muestra hitos hechos, plazo y tiempo transcurrido, con la línea de tiempo de la plantilla.
- "Tickets del proyecto" muestra sus tickets con la etiqueta de estado y enlace a su edición. Sin tickets muestra "Sin tickets.".
- "Ver todos" lleva a `/tickets?project=<uuid>`.
- Archivar y restaurar solo cambian el estado local, la etiqueta y el aviso.
- Eliminar pide confirmación en el mismo sitio. El texto usa el número real de tickets y omite esa frase si no hay.
- Tras eliminar, el aviso "Proyecto <código> eliminado." enlaza a `/projects`. Los campos, los hitos, los atajos y los botones de guardar, descartar, archivar y eliminar quedan `disabled`.

### Línea de tiempo

- `project-timeline.tsx` la usa la vista previa del alta y el panel "Avance".
- Va del inicio al término. La barra llega a hoy, limitada entre 0 % y 100 %.
- En la edición, los hitos hechos usan el tono `green` y los pendientes un rombo vacío.
- Es decorativa, con `aria-hidden`. Las cifras se leen como texto.

### Tickets filtrados por proyecto

- `/tickets?project=<uuid>` abre el listado con ese proyecto y el filtro "Todos".
- Un `project` ausente o desconocido deja el listado normal.
- El parámetro se lee dentro de `Suspense`. El listado usa el proyecto como `key`, así que un parámetro distinto lo reinicia.

### Estado al navegar

- Alta y edición se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda, filtro, "Solo atrasados" y orden.
- La edición no ve los cambios hechos en otras pantallas.

### Accesibilidad

- Estado y prioridad son radios nativos, para usar las flechas del teclado. La prioridad usa `PillRadioGroup`; el estado, `.crm-option`.
- Cada hito tiene etiquetas ocultas para nombre, fecha y casilla, y un botón "Quitar hito N".
- Los campos con error llevan `aria-invalid="true"` y `aria-describedby`.
- Los `id` de formularios salen de `useId`.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Mover lo genérico.** `pill-radio-group.tsx` y `use-today.ts` pasan a `components/`. Cambiar los imports de tickets.
2. **Ampliar el modelo.** Tipos nuevos en `features/projects/types/project.ts` y prioridades con sus tonos en `features/projects/constants.ts`.
3. **Ampliar los datos.** Campos nuevos de los 8 proyectos en `data/projects.ts`.
4. **Crear las utilidades.** `features/projects/utils.ts`: búsqueda, atrasado y próximo, textos relativos, duración, fechas, validación, tickets del proyecto y proyectos de un contacto.
5. **Crear la etiqueta y la ruta.** `project-status-badge.tsx`, `app/projects/layout.tsx`, `app/projects/page.tsx` con el título, y el enlace en `components/app-shell.tsx`.
6. **Crear la tabla.** `projects-table.tsx`, con orden, enlaces y acciones.
7. **Crear el listado.** `projects-list.tsx`, con resumen, filtros, vacíos y pie. Conectarlo a la página.
8. **Crear los datos del proyecto.** `project-data-fields.tsx`, con nombre, código, cliente y descripción. Mostrarlo en `app/projects/new/page.tsx`.
9. **Crear estado y fechas.** `project-status-fields.tsx` y `project-date-fields.tsx`, con duración rápida y "Mover término".
10. **Crear los hitos.** `project-milestones.tsx`, con alta, quitar, rango y, en la edición, casilla y vencidos.
11. **Crear la línea de tiempo.** `project-timeline.tsx`.
12. **Crear el alta.** `project-create-form.tsx` y `project-preview.tsx`, con validación, aviso, "Cargando proyecto…" y reinicio al navegar.
13. **Crear la ruta de edición.** `app/projects/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/projects/[id]/not-found.tsx` en español, con `<title>` propio y enlace a `/projects`.
14. **Crear la edición.** `project-edit-form.tsx`, con cabecera, cambios sin guardar, cliente de otra empresa, aviso de completado y motivo.
15. **Crear el panel lateral.** `project-sidebar.tsx`, con avance, tickets e historial.
16. **Crear la zona de peligro.** `project-danger-zone.tsx`, con archivado, eliminación y bloqueo posterior.
17. **Enlazar desde tickets.** Enlaces a `/projects/<uuid>` en `tickets-table.tsx`, `project-fields.tsx` y `ticket-sidebar.tsx`.
18. **Filtrar tickets por proyecto.** Leer `project` en `app/tickets/page.tsx` dentro de `Suspense` y pasarlo a `tickets-list.tsx` como valor inicial y `key`.
19. **Actualizar `CLAUDE.md`.** Añadir `/projects`, `?project=`, las piezas movidas a `components/` y las nuevas reglas de dependencias. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 5 a 16 sin carpeta indicada van en `features/projects/components/`.
Los pasos 3, 7, 10, 12 y 14 superan 50 líneas por los datos o el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features lib` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` no cambia.
- [ ] Ningún archivo `.tsx` nuevo contiene colores hexadecimales ni estilos `dark:`.
- [ ] Ningún archivo de `features/projects` o `features/tickets` importa de `features/clients`, salvo tipos.
- [ ] Ningún archivo importa de `features/tickets/components/pill-radio-group` ni de `features/tickets/components/use-today`.
- [ ] Los títulos son "Proyectos — CRM TI", "Nuevo proyecto — CRM TI", "Editar proyecto — CRM TI" y, en un ID inexistente, "Proyecto no encontrado — CRM TI".
- [ ] El menú muestra 8 elementos y solo "Clientes", "Tickets" y "Proyectos" tienen `href`.
- [ ] `/projects` muestra 8 filas, "8 proyectos · 6 activos" y los totales 3, 1, 1 y 2.
- [ ] La primera fila es PRJ-012 y la última PRJ-025. El pie dice "Mostrando 8 de 8 proyectos · ordenados por fecha de término".
- [ ] PRJ-018 muestra "Atrasado 3 días" y PRJ-022 "En 4 días", ambos con icono; PRJ-015 muestra "Terminado".
- [ ] Buscar "clinica" deja PRJ-018 y PRJ-025; buscar "zzz" muestra "Sin resultados".
- [ ] "Solo atrasados" deja solo PRJ-018. El chip "En pausa" deja solo PRJ-019 y tiene `aria-pressed="true"`.
- [ ] Pulsar "Nombre del proyecto" ordena por nombre y `aria-sort` pasa a `ascending`; otra pulsación, a `descending`.
- [ ] Con `projects` vacío temporalmente se muestra "Aún no hay proyectos" y "Todavía no hay proyectos.".
- [ ] "⋯" tiene `disabled`. Nombre y lápiz abren la edición; el contacto abre `/clients/<uuid>`.
- [ ] El alta muestra `PRJ-026`, el inicio en hoy, "Planificado" y "Media".
- [ ] Crear el alta vacía muestra 3 errores y "Revisa los campos marcados antes de crear el proyecto.".
- [ ] Un término anterior al inicio muestra "Termina antes de empezar: revisa las fechas." sin intentar crear.
- [ ] Elegir a Andrea Valdés muestra "Andes Logística SpA · Decisor · 1 proyecto con este contacto".
- [ ] "+1 mes" rellena el término y muestra la duración y la línea de tiempo.
- [ ] Un hito fuera del rango muestra su error e impide crear.
- [ ] Crear un proyecto completo muestra el aviso con PRJ-026; `/projects` sigue mostrando 8 filas.
- [ ] Los 8 proyectos abren su edición; `/projects/not-found` muestra la página de proyecto no encontrado.
- [ ] PRJ-021 muestra "2 de 4 hechos · 2 pendientes", "Vencido hace 2 días" en el tercer hito, "2/4", "Quedan 12 d" y "71%".
- [ ] El panel de PRJ-021 muestra #T-1048, #T-1044 y #T-1037 con enlace; el de PRJ-012, "Sin tickets.".
- [ ] Elegir "Completado" en PRJ-021 muestra "1 cambio sin guardar: estado (En curso → Completado)" y el aviso de 2 hitos pendientes; "Descartar" lo revierte.
- [ ] Elegir a Catalina Morales en PRJ-021 muestra "Pasará de Andes Logística SpA a Pacífico Abogados.".
- [ ] "+1 semana" en PRJ-021 muestra la caja con "(+7 días)". Guardar con motivo muestra "Cambios guardados (1)." y añade "Término movido +7 días · motivo: … · ahora" al historial.
- [ ] Vaciar el nombre y guardar muestra "El nombre no puede quedar vacío." y "Revisa los campos marcados antes de guardar.".
- [ ] Archivar muestra la etiqueta "Archivado" y restaurar la quita.
- [ ] Eliminar PRJ-021 requiere dos pulsaciones y menciona 3 tickets; en PRJ-012 omite esa frase. Después todo queda deshabilitado y el aviso enlaza a `/projects`.
- [ ] "Ver todos" de PRJ-021 abre `/tickets?project=<uuid>` con 3 filas, "Todos" y PRJ-021 elegidos.
- [ ] `/tickets?project=x` muestra el listado normal con 9 filas.
- [ ] En `/tickets`, la tabla, los grupos de "Por proyecto", el alta, la edición y el panel lateral enlazan al proyecto.
- [ ] Un borrador de alta o edición desaparece al volver por un enlace y se conserva al volver con atrás.
- [ ] El listado conserva búsqueda, filtro, "Solo atrasados" y orden al volver.
- [ ] Las flechas del teclado cambian estado y prioridad.
- [ ] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [ ] Con Playwright, las pantallas de `/projects`, `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px.
- [ ] Los criterios de `/tickets` del SPEC 04 siguen cumpliéndose.

## Decisiones

- **Sí:** tres pantallas y los enlaces desde tickets en un spec. Lo eligió el usuario; cierra el hueco del SPEC 04.
- **No:** panel de proyectos en `/clients/[id]`. No está en `ClienteEditar` y habría que diseñarlo.
- **Sí:** PRJ-021 completo y los otros 7 mínimos, con inicio y prioridad. Mismo patrón que los SPEC 03 y 04; la línea de tiempo y la duración necesitan inicio.
- **Sí:** desfases en días para inicio, término, hitos, historial y creación. Con fechas fijas, los ejemplos envejecerían.
- **Sí:** "Ver todos" a `/tickets?project=<uuid>` con "Todos". El listado ya tiene el filtro y así coincide con el panel.
- **Sí:** la key del listado de tickets es el proyecto. Sin ella, el estado conservado ignoraría el parámetro.
- **Sí:** mover `pill-radio-group` y `use-today` a `components/`. Son genéricos y los usan dos dominios.
- **Sí:** `features/projects` importa de `features/tickets` la etiqueta de estado y los datos, como ya hace clientes.
- **Sí:** "Cargando proyecto…" en el alta. El inicio por defecto depende del día del navegador.
- **Sí:** archivar solo en local y eliminar con bloqueo posterior. Es la regla de los SPEC 03 y 04.
- **No:** ocultar del listado los archivados. Requiere estado compartido, descartado en los SPEC 03 y 04.
- **Sí:** prioridad de 3 niveles, con Alta en rojo. Así está en ambas plantillas, aunque tickets tenga 4.
- **Sí:** inicio obligatorio también en la edición. La plantilla lo exigía solo en el alta.
- **Sí:** número real de proyectos por contacto. La plantilla daba 2 a Andrea, que solo tiene PRJ-021.
- **Sí:** número real de tickets al eliminar. La plantilla fijaba 3.
- **Sí:** singular en "Vencido hace 1 día" y en los textos relativos. La plantilla siempre decía "días".
- **Sí:** conservar "⋯" deshabilitado. No tiene menú diseñado.
- **No:** nombre único. La base lo exige, pero no está en las plantillas; va con la conexión.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Leer `searchParams` en `/tickets` rompe el prerender con `cacheComponents`. | Leerlo dentro de `Suspense`, como en `/tickets/new`; compilar al cerrar el paso 18. |
| La `key` por proyecto pierde el estado conservado del listado de tickets. | Solo cambia al entrar con otro `project`; comprobar los criterios de navegación del SPEC 04. |
| Mover `use-today` y `pill-radio-group` rompe tickets. | Hacerlo en el paso 1, sin cambios de comportamiento, y compilar. |
| Importaciones en ambos sentidos entre `features/projects` y `features/tickets` crean un ciclo de módulos. | Importar componentes y utilidades concretas, nunca un índice; revisar el build al cerrar el paso 15. |
| Los avisos hacen creer que los datos persisten. | No desplegarla como producto hasta conectar la base. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Cambios en el esquema de la base.
- Panel de proyectos en clientes.
- Alta de proyecto desde un cliente y alta de ticket desde un proyecto.
- Menú "⋯".
- Nombre de proyecto único.
- Estado compartido entre pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
