# SPEC 03 — Frontend de clientes

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-25
> **Objetivo:** Que el listado, el alta y la edición de clientes se puedan usar en `/clients` con el armazón del CRM y datos de ejemplo, sin backend.

## Por qué existe este spec

Es la primera pantalla del MVP.
Fija el armazón y las convenciones que reutilizarán los demás módulos.

La referencia son `Clientes`, `ClienteNuevo` y `ClienteEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- Armazón con menú lateral para las rutas de `/clients`.
- `/clients`: búsqueda, filtro por rol, orden, estados vacíos y aviso de exportación.
- `/clients/new`: validaciones, sugerencias de empresa, vista previa, progreso y "Guardar y crear otro".
- `/clients/[id]`: cambios sin guardar, validaciones, archivado, eliminación y panel lateral.
- Página de cliente no encontrado.
- Datos de ejemplo en `data/clients.ts`.
- Redirección de `/` a `/clients` y títulos de página.
- Estilo de elemento deshabilitado del menú en `app/globals.css`.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/schema.prisma`.
- Descarga real del CSV, menú "⋯" y paginación funcional.
- Compartir cambios entre pantallas.
- Las demás pantallas del menú.
- Selector de acento.

## Modelo de datos

Los tipos van en `features/clients/types/client.ts`. Son propios del frontend y siguen la plantilla, no el modelo `client` de Prisma.

```ts
export type ClientRole =
  | "Decisor"
  | "Contacto técnico"
  | "Facturación"
  | "Usuario final";

export type TicketStatus = "Abierto" | "En curso" | "Cerrado";

// Valores editables; el formulario de alta admite `role` vacío.
export interface ClientFormValues {
  firstName: string;
  lastName: string;
  company: string;
  phonePrefix: string; // "+56"
  phone: string; // solo dígitos en los datos: "955550101"
  email: string;
  street: string;
  unit: string; // depto., oficina o piso; puede ser ""
  city: string; // comuna o ciudad
  region: string;
  role: ClientRole | "";
  notes: string;
}

export interface Client extends ClientFormValues {
  id: string; // UUID
  role: ClientRole;
  since?: string; // "mar 2025"
  tickets: { id: string; title: string; status: TicketStatus }[];
  history: string[];
}
```

`data/clients.ts` exporta `clients: Client[]`, con los 8 clientes de `Clientes.dc.html` y UUID fijos.

- La dirección de cada cliente se separa en `street`, `unit`, `city` y `region`. Las regiones usan los nombres del selector.
- Andrea Valdés lleva las notas, los tickets, el historial y `since` de `ClienteEditar.dc.html`.
- Los otros 7 llevan `notes: ""`, `tickets: []`, `history: []` y no tienen `since`.

Las empresas, sus conteos, los correos existentes y "otros contactos" se calculan a partir de `clients`. La dirección de una empresa es la de su primer contacto.

`features/clients/constants.ts` contiene los prefijos, las 16 regiones y los roles con su descripción.

| Valor | Tono |
|---|---|
| Decisor, ticket Abierto | `orange` |
| Contacto técnico, ticket En curso | `blue` |
| Facturación | `green` |
| Usuario final, ticket Cerrado | `gray` |

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Modelo `client` |
|---|---|
| `street`, `unit`, `city`, `region` | Un solo `address` |
| `phonePrefix`, `phone` | Un solo `number` |
| `role`, de 4 valores | `id_rol`; `rol.rol` admite 10 caracteres y "Contacto técnico" tiene 16 |
| `notes`, `since` y archivado | No existen |
| `history` | No existe |
| `tickets` por cliente | `tickets` solo se relaciona con `project` |
| Sin límites de longitud | `first_name` 20, `last_name` 25, `company` 40, `email` 50 |

## Comportamiento

### Armazón

- Solo "Clientes" es un enlace. Lleva `aria-current="page"` en las tres pantallas.
- Los otros 7 elementos del menú son `<a role="link" aria-disabled="true">` sin `href`. También "Ver todos" en el panel de tickets.
- "Nuevo ticket para este contacto" es un botón `disabled`.
- El usuario es el de la plantilla: Martín Vidal, Administrador.

### Listado

- Busca sin distinguir mayúsculas ni tildes. El teléfono también coincide sin espacios.
- El orden inicial es por apellido, ascendente. Se ordena por nombre, apellido, empresa y rol.
- La dirección muestra `street, unit` en la primera línea y `city, region` en la segunda.
- "Exportar CSV" solo muestra el aviso de la plantilla.
- "⋯", "Anterior" y "Siguiente" están siempre `disabled`.
- El icono de lápiz abre `/clients/<id>`.
- Con la lista vacía se muestra "Aún no tienes clientes"; sin coincidencias, "Sin resultados".

### Alta

- Los errores aparecen al primer intento de guardar y se actualizan al escribir.
- El aviso de errores dice "Falta 1 campo por revisar." con uno, y "Faltan N campos por revisar." con más.
- Un correo duplicado advierte, pero no impide guardar. "Ver contacto" abre `/clients/<id>` de ese cliente.
- "Guardar cliente" muestra el aviso y conserva los valores.
- "Guardar y crear otro" conserva empresa, dirección y prefijo, y vacía el resto.

### Edición

- "Guardar cambios" está `disabled` si no hay cambios. Al guardar, los valores pasan a ser la referencia de los cambios.
- El correo del propio cliente no cuenta como duplicado.
- Sin tickets, historial u otros contactos se muestra "Sin tickets.", "Sin historial." o "Sin otros contactos.".
- Sin `since` se omite "cliente desde".
- Archivar y restaurar solo cambian el estado local, la etiqueta y el aviso.
- Eliminar pide confirmación en el mismo sitio. El texto usa el número real de tickets y omite esa frase si no hay.
- Tras eliminar, el aviso "… fue eliminado." enlaza a `/clients`. Los campos y los botones de guardar, descartar, archivar y eliminar quedan `disabled`.

### Estado al navegar

`cacheComponents` conserva el estado de hasta 3 rutas al navegar.

- Alta y edición se reinician al entrar por un enlace, usando `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda, filtro y orden. Su aviso de exportación se cierra al salir de la pantalla.

### Teléfonos

- Se ignora todo lo que no sea dígito al validar. Cada prefijo exige el número de dígitos de la plantilla.
- Con `+56` y 9 dígitos, si el primero es 9 o 2 el formato es `+56 9 5555 0101`.
- Con otro primer dígito, el formato es `+56 32 255 0107`.
- Con los demás prefijos, el formato es el prefijo, un espacio y los dígitos.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Crear tipos y constantes.** `features/clients/types/client.ts` y `features/clients/constants.ts`.
2. **Crear los datos.** `data/clients.ts`, con los 8 clientes.
3. **Crear las utilidades.** `features/clients/utils.ts`: normalización de texto, iniciales, formato y validación de teléfono, correo, empresas derivadas y búsqueda por ID.
4. **Crear los iconos.** `components/icons.tsx`, con los SVG de las tres plantillas, decorativos con `aria-hidden`.
5. **Crear el armazón.** `components/app-shell.tsx`, con una prop para el elemento activo, y `app/clients/layout.tsx`. Añadir en `app/globals.css` el estado `[aria-disabled="true"]` de `.crm-nav-item`: opacidad 0.45, cursor `not-allowed` y sin hover. Crear `app/clients/page.tsx` con el título.
6. **Cambiar el inicio.** Redirigir a `/clients` en `app/page.tsx`. En `app/layout.tsx`, usar el título por defecto "CRM TI", la plantilla `%s — CRM TI` y una descripción en español. Añadir el título de `/clients`.
7. **Crear piezas compartidas.** `components/breadcrumb.tsx` y `components/alert.tsx`; `features/clients/components/role-badge.tsx`.
8. **Crear la tabla.** `features/clients/components/clients-table.tsx`, con filas, orden, acciones deshabilitadas y desplazamiento horizontal.
9. **Crear el listado.** `features/clients/components/clients-list.tsx`, con búsqueda, filtros, aviso, vacíos y pie. Conectarlo a la página.
10. **Crear los campos de contacto.** `features/clients/components/contact-fields.tsx`, con las sugerencias de empresa y el teléfono. Mostrarlos en `/clients/new`.
11. **Crear los demás campos.** `address-fields.tsx` y `role-fields.tsx` en la misma carpeta. Añadirlos a la página junto a las notas.
12. **Crear el alta.** `client-create-form.tsx` y `client-preview.tsx`, con validación, avisos, vista previa, progreso y reinicio al navegar.
13. **Crear la ruta de edición.** `app/clients/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/clients/[id]/not-found.tsx` en español con enlace a `/clients`.
14. **Crear la edición.** `client-edit-form.tsx`, con los campos compartidos, los cambios sin guardar y el reinicio al navegar.
15. **Crear el panel lateral.** `client-sidebar.tsx`, con tickets, otros contactos e historial.
16. **Crear la zona de peligro.** `client-danger-zone.tsx`, con archivado, eliminación y bloqueo posterior.
17. **Actualizar `CLAUDE.md`.** Añadir `data/`, `components/`, `/clients` y la convención de rutas en inglés; quitar las notas sobre `app/page.tsx` y la carpeta vacía `app/clients`. Es un archivo local, sin rastrear en git.

Los pasos 14 a 16 usan la carpeta `features/clients/components/`.
Los pasos 8, 9, 12 y 14 superan 50 líneas por el marcado; se aceptan porque dividirlos dejaría pantallas a medias.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` no cambia.
- [ ] Ningún archivo nuevo `.tsx` contiene colores hexadecimales ni estilos `dark:`.
- [ ] `/` redirige a `/clients`.
- [ ] El título de `/clients` es "Clientes — CRM TI"; el de `/clients/new`, "Nuevo cliente — CRM TI"; el de `/clients/<id>`, "Editar cliente — CRM TI".
- [ ] El menú muestra 8 elementos y solo "Clientes" tiene `href`.
- [ ] `/clients` muestra 8 filas, ordenadas por apellido, y "8 contactos · 5 empresas".
- [ ] Buscar "valdes" deja solo a Andrea Valdés; buscar "955550105" deja solo a Paula Navarro.
- [ ] El filtro "Decisor" deja 3 filas y tiene `aria-pressed="true"`.
- [ ] Buscar "zzz" muestra "Sin resultados". Con `clients` vacío temporalmente se muestra "Aún no tienes clientes".
- [ ] Pulsar "Apellido" invierte el orden y `aria-sort` pasa a `descending`.
- [ ] "Exportar CSV" muestra "Se exportaron 8 contactos a clientes.csv." y no descarga nada.
- [ ] "⋯", "Anterior" y "Siguiente" tienen `disabled`.
- [ ] Guardar el alta vacía muestra 9 errores y "Faltan 9 campos por revisar.".
- [ ] Escribir "Andes" en la empresa sugiere "Andes Logística SpA"; al elegirla aparece "Usar la dirección de la empresa", que rellena la dirección.
- [ ] Guardar un alta completa muestra el aviso y 8/8 campos; `/clients` sigue mostrando 8 filas.
- [ ] "Guardar y crear otro" con un alta completa conserva empresa, dirección y prefijo, y vacía los demás campos.
- [ ] El correo `andrea.valdes@example.com` advierte del duplicado en el alta y no en la edición de Andrea.
- [ ] Los 8 iconos de lápiz abren la edición con los datos de su cliente.
- [ ] `/clients/not-found` (un ID inexistente) muestra la página de cliente no encontrado.
- [ ] Cambiar el nombre activa "Guardar cambios" y muestra "1 cambio sin guardar: nombre"; "Descartar" lo revierte.
- [ ] Guardar una edición muestra "Cambios guardados (1)." y vuelve a deshabilitar el botón.
- [ ] Archivar muestra la etiqueta "Archivado" y restaurar la quita.
- [ ] Eliminar requiere dos pulsaciones; después el formulario queda deshabilitado y el aviso enlaza a `/clients`.
- [ ] La edición de Paula Navarro muestra "Sin tickets.", "Sin historial." y "Sin otros contactos.".
- [ ] Un borrador de alta desaparece al salir y volver por un enlace, y se conserva al volver con atrás.
- [ ] La búsqueda, el filtro y el orden del listado se conservan al volver; el aviso de exportación no.
- [ ] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [ ] Con Playwright, las tres pantallas no tienen errores en consola ni desbordan la página en horizontal a 1440 px y 390 px.
- [ ] Con Playwright, botones, campos, chips, enlaces del menú y filas muestran su hover o foco del SPEC 02.

## Decisiones

- **Sí:** armazón y tres pantallas en un spec. Alta y edición comparten los campos.
- **Sí:** lógica de interfaz local. El usuario excluyó la lógica de negocio y el backend.
- **Sí:** `/clients`, `/clients/new` y `/clients/[id]`. El usuario eligió la carpeta existente en vez de las rutas de `LEEME.md`.
- **Sí:** identificadores en inglés y textos en español. Coincide con `features/clients` y las clases `crm-*`.
- **Sí:** ejemplos en `data/`, en la raíz. Se retira al conectar la base.
- **Sí:** datos con la forma de la plantilla. Las diferencias con Prisma quedan registradas aquí.
- **Sí:** UUID fijos. Coinciden con el SPEC 01.
- **No:** estado compartido entre pantallas. Sería código desechable.
- **Sí:** menú completo con elementos deshabilitados. Conserva el diseño y evita los 404.
- **Sí:** conservar "⋯" deshabilitado. No tiene menú diseñado.
- **Sí:** los 7 clientes sin datos extra muestran textos vacíos. Evita inventar datos y permite revisar esos estados.
- **Sí:** reiniciar formularios y conservar el listado. Un borrador o aviso viejo confunde; los filtros no.
- **Sí:** bloquear el formulario tras eliminar. En la plantilla seguía editable.
- **Sí:** activar el menú con una prop y no con `usePathname`. Evita suspender en IDs desconocidos con `cacheComponents`.
- **No:** `dynamicParams = false`. No está disponible con `cacheComponents`.
- **Sí:** corregir el formato de los fijos con código de área de 2 dígitos. La plantilla mostraba `+56 3 2255 0107`.
- **Sí:** mostrar la región del selector en el listado. La plantilla usaba "Santiago", que no es una opción.
- **Sí:** divisores de la zona de peligro con `--color-tone-red-line`. Evita un token nuevo para `#F6DAD5`.
- **Sí:** 8 px entre chips. El SPEC 02 lo exige para no solapar sus zonas de clic.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Los avisos de guardado hacen creer que los datos persisten. | Es una maqueta local; no desplegarla como producto hasta conectar la base. |
| El build rechaza `params` fuera de `Suspense`. | Usar `generateStaticParams` con los 8 ID y, si aun así falla, envolver el contenido en `Suspense`. |
| `bfcacheId` no reinicia al guardar o recargar como se espera. | Comprobarlo con los criterios de navegación antes de cerrar los pasos 12 y 14. |
| El tipo del frontend diverge del modelo de la base. | Usar la tabla de diferencias como punto de partida del spec de conexión. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Cambios en el esquema de la base.
- Descarga de CSV, menú "⋯" y paginación.
- Estado compartido entre pantallas.
- Las demás pantallas del menú.
- Selector de acento.

Cada uno de estos puntos, si se aborda, va en su propio spec.
