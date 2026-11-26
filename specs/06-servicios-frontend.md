# SPEC 06 — Frontend de servicios

> **Estado:** Implementado
> **Depende de:** SPEC 02, SPEC 03, SPEC 05
> **Fecha:** 2026-11-26
> **Objetivo:** Que el listado, el alta y la edición de servicios recurrentes se puedan usar en `/services`, enlazados a clientes y proyectos, con datos de ejemplo y sin backend.

## Por qué existe este spec

Es el cuarto módulo del MVP y el único del menú "Operación" que todavía no tiene pantallas, salvo el Dashboard.
Los servicios son lo que se cobra de forma recurrente a cada cliente y lo que se paga a los proveedores por ellos.

La referencia son `Servicios`, `ServicioNuevo` y `ServicioEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- `/services`: indicadores, próximas renovaciones, pestañas por tipo, búsqueda, filtro por empresa, "Mostrar cancelados", orden, "Registrar renovación" con "Deshacer" y estados vacíos.
- `/services/new`: tipo, datos, cliente, proyecto, cobro y costo, margen, renovación, estado inicial, notas con aviso de contraseñas, vista previa y "Guardar y agregar otro".
- `/services/[id]`: cambios sin guardar, botones rápidos, estado con cancelación y pausa, cambio de precio, renovación, notas, cobros al cliente, resumen, impacto en el ingreso, otros servicios de la empresa y eliminación.
- Página de servicio no encontrado.
- Tipos en `features/services/types/service.ts` y datos ficticios en `data/services.ts`.
- Enlace "Servicios" en el menú.
- Enlaces desde los servicios a `/clients/<uuid>` y `/projects/<uuid>`.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/`.
- Paneles de servicios en `/clients/[id]` y en `/projects/[id]`.
- Alta de servicio desde un cliente o un proyecto (`?client=`, `?project=`).
- Cambiar el cliente o el tipo de un servicio en la edición.
- Avisos reales de renovación (correo, notificaciones) y cobros automáticos.
- Conversión de monedas.
- Estado compartido entre pantallas.

## Modelo de datos

`features/services/types/service.ts`:

```ts
export type ServiceType =
  | "Mantención"
  | "Hosting e infraestructura"
  | "Dominios y SSL"
  | "Licencias y APIs";
export type ServiceStatus = "Activo" | "En pausa" | "Cancelado";
export type ServicePeriod = "mes" | "año";
export type ServiceNoticeDays = 3 | 7 | 15 | 30;

export interface ServiceCharge {
  monthsAgo: number; // 0 es el mes en curso
  amount: number; // CLP cobrado al cliente ese periodo
  cost: number; // CLP pagado al proveedor ese periodo
  paidDay: number | null; // día del mes en que pagó; null es pendiente
}

export interface Service {
  id: string; // UUID
  name: string;
  type: ServiceType;
  provider: string; // "Tú" en Mantención
  clientId: string; // contacto, en data/clients.ts
  projectId: string | null; // proyecto de la misma empresa
  period: ServicePeriod;
  charge: number; // CLP por periodo
  cost: number; // CLP por periodo
  renewInDays: number; // desfase respecto a hoy
  noticeDays: ServiceNoticeDays;
  autoRenew: boolean;
  status: ServiceStatus;
  notes: string; // puede ser ""
  createdDaysAgo: number;
  endInDays: number | null; // último día; solo si está "Cancelado"
  cancelReason: string; // puede ser ""
  charges: ServiceCharge[]; // del más reciente al más antiguo
}

// Valores editables; el alta admite `clientId` vacío.
export interface ServiceFormValues {
  name: string;
  type: ServiceType;
  provider: string;
  clientId: string;
  projectId: string; // "" es "Sin proyecto"
  period: ServicePeriod;
  charge: number; // 0 si está vacío
  cost: number;
  renewDate: string; // "2026-11-26" o ""
  noticeDays: ServiceNoticeDays;
  autoRenew: boolean;
  status: ServiceStatus;
  notes: string;
  endDate: string; // último día al cancelar
  cancelReason: string;
}
```

`endDate` y `cancelReason` no cuentan como cambio por sí solos.
Se guardan junto con el paso a "Cancelado" y se vacían al guardar otro estado.

Reglas:

- La empresa del servicio es la de su contacto.
- Los proyectos que se pueden elegir son los de los contactos de esa empresa, en el orden de `data/projects.ts`.
- El valor mensual de un monto es el monto si `period` es "mes" y el monto / 12 si es "año".
- El ingreso recurrente mensual es la suma del cobro mensual de los servicios "Activo". El costo mensual es la suma de su costo mensual.
- Un servicio vence pronto si está "Activo" y `renewInDays` está entre 0 y 14. Está vencido si está "Activo" y `renewInDays < 0`.
- Las próximas renovaciones son los servicios "Activo" con `renewInDays` entre 0 y 30, por fecha ascendente.
- El margen es bajo si el cobro es mayor que 0 y el margen es menor que el 20 % del cobro.
- Los otros servicios de una empresa son los de sus contactos que no están "Cancelado", sin el propio, en el orden de `data/services.ts`.

### Servicios de ejemplo

`data/services.ts` exporta los 11 servicios de `Servicios.dc.html`, con UUID fijos.
El nombre, el tipo, el proveedor, el cobro, el costo, la periodicidad, la renovación automática y el estado son los de esa plantilla.
`renewInDays` es su `off`.

| Servicio | Contacto | Proyecto |
|---|---|---|
| Plan de mantención web · 8 h/mes | Benjamín Araya | PRJ-019 |
| VPS 4 GB para el sitio | Benjamín Araya | PRJ-019 |
| Dominio quillayes.example | Benjamín Araya | PRJ-019 |
| Hosting del portal de clientes | Andrea Valdés | PRJ-021 |
| Base de datos del portal | Andrea Valdés | PRJ-021 |
| SSL comodín \*.andeslogistica.example | Andrea Valdés | `null` |
| Soporte evolutivo app de agenda · bolsa 20 h | Javiera Contreras | PRJ-018 |
| API de WhatsApp para recordatorios | Javiera Contreras | PRJ-018 |
| Correo transaccional | Catalina Morales | PRJ-022 |
| Mantención de la tienda online | Paula Navarro | PRJ-015 |
| Hosting compartido antiguo | Ignacio Sepúlveda | `null` |

- "Hosting del portal de clientes" lleva `createdDaysAgo: 210` y 4 cobros, con `monthsAgo` 0 a 3. Los montos son 35.000, 35.000, 35.000 y 30.000, todos con costo 19.000. El primero está pendiente; los otros, pagados los días 3, 5 y 2.
- "Hosting compartido antiguo" lleva `endInDays: -30` y `cancelReason: "El cliente migró a su propio servidor"`.
- Los demás llevan `createdDaysAgo: 120`, `endInDays: null`, `cancelReason: ""` y `charges: []`.
- Todos llevan `noticeDays: 7` y `notes: ""`.

### Tonos

| Valor | Tono |
|---|---|
| Servicio Activo, cobro Pagado | `green` |
| Servicio En pausa, margen bajo, próximas renovaciones | `amber` |
| Servicio Cancelado | `gray` |
| Cobro Pendiente | `orange` |
| Renovación vencida, próxima renovación en 7 días o menos | `red` |

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Modelo `services` |
|---|---|
| `type`, `provider`, `period`, `autoRenew`, `status`, `notes` | No existen |
| `charges`, `createdDaysAgo`, `endInDays`, `cancelReason` | No existen |
| `renewInDays` como desfase | `date_renovation` es una fecha |
| `noticeDays` numérico | `expiration_days` es texto |
| `clientId` obligatorio | `id_client` opcional |
| `charge` y `cost` | `charge_client` y `cost`, ambos `Int` |

## Comportamiento

### Armazón y enlaces

- "Servicios" lleva a `/services` y tiene `aria-current="page"` en las tres pantallas.
- Los enlaces a un servicio llevan a `/services/<uuid>`. Los de la empresa, a `/clients/<uuid>` de su contacto. Los del proyecto, a `/projects/<uuid>`.

### Fechas y montos

- "Hoy" se calcula en el navegador con `useToday`.
- El listado muestra "Cargando servicios…" y el alta y la edición "Cargando servicio…" hasta conocer la fecha.
- Las fechas se muestran con `es-CL`, como `26 nov 2026`. Los periodos de cobro, como `nov 2026`.
- Los montos se muestran en CLP sin decimales, como `$35.000`. Los campos de monto aceptan solo dígitos y muestran separador de miles.
- La cabecera de la edición dice "desde <mes año>", calculado con `createdDaysAgo`.

### Listado

- El orden inicial es por próxima renovación: primero por estado (Activo, En pausa, Cancelado) y luego por fecha ascendente.
- Se ordena por servicio, empresa, cobro mensual, próxima renovación y estado.
- Las pestañas son Todos, Mantención, Hosting e infraestructura, Dominios y SSL y Licencias y APIs, con el número de servicios visibles de cada tipo.
- La búsqueda cubre nombre, proveedor, contacto, empresa y código de proyecto, sin distinguir mayúsculas ni tildes.
- El filtro de cliente ofrece las empresas con servicios, en orden alfabético.
- Los cancelados se ocultan salvo con "Mostrar cancelados". Se muestran tachados.
- El texto relativo es "Cancelado", "Pausado, no se cobra", "Venció hace N días", "Renueva hoy" o "En N días", en singular con 1.
- Vencidos y próximos a vencer llevan el icono de advertencia y su color.
- El costo 0 se muestra como "$0 (tu tiempo)". El margen muestra el monto y el porcentaje, en `amber` si es bajo.
- Los indicadores y el resumen usan singular cuando la cantidad es 1.
- "Registrar renovación" solo aparece en próximas renovaciones manuales. Suma 30 días si es mensual o 365 si es anual.
- El aviso permite "Deshacer" solo el último cambio. Los automáticos muestran "Automática".
- La sección de próximas renovaciones se oculta si no hay ninguna.

### Alta

- Los valores iniciales son "Hosting e infraestructura", "Mensual", renovación en un mes, aviso de 7 días, renovación automática y "Activo".
- El estado inicial solo ofrece Activo y En pausa.
- Elegir "Mantención" fija el proveedor en "Tú", de solo lectura, y el costo en 0.
- El placeholder del nombre cambia con el tipo, como en la plantilla.
- El cliente es un selector de contactos, con el formato del alta de proyectos.
- El proyecto está `disabled` hasta elegir cliente. Cambiar de cliente lo vacía.
- Los errores de nombre, proveedor, cliente y cobro aparecen al primer intento. El de renovación pasada aparece al momento.
- Las notas con `password:`, `contraseña=`, `token:`, `secret:` o `api_key:` muestran el aviso de la plantilla. No impiden guardar.
- La vista previa muestra el ingreso mensual actual, el nuevo y la diferencia. Un servicio anual suma 1/12 por mes.
- "Guardar servicio" muestra el aviso de la plantilla y conserva los valores. No añade el servicio al listado.
- "Guardar y agregar otro" conserva cliente y proyecto, vacía el resto y suma el servicio guardado al ingreso actual de la vista previa.

### Edición

- La cabecera muestra la etiqueta del estado guardado, el nombre, el proveedor y la empresa con enlace.
- Los botones rápidos son los de la plantilla según el estado elegido: Pausar, Cancelar servicio o Reactivar. Solo eligen el estado; hay que guardar.
- "Guardar cambios" está `disabled` si no hay cambios. Al guardar, los valores pasan a ser la referencia.
- Los cambios cuentan por nombre, proveedor, proyecto, estado, periodicidad, cobro, costo, renovación, aviso, renovación automática y notas. El estado se muestra como "estado (Activo → Cancelado)".
- Los campos cambiados muestran "· modificado" o "· modificada", según el género de la etiqueta. Notas muestra "· modificadas".
- Nombre y cobro mayor que 0 son obligatorios.
- En Mantención, el proveedor sigue siendo "Tú", de solo lectura.
- El proyecto ofrece "Sin proyecto" y los proyectos de la empresa.
- Pasar a "Cancelado" muestra la caja de baja, con el último día (por defecto, la renovación) y el motivo.
- Pasar a "En pausa" muestra el aviso de la plantilla.
- Con el estado guardado "Cancelado", la sección Estado muestra "Último día: <fecha> · Motivo: <motivo>". Sin motivo, omite esa parte.
- Cambiar el cobro muestra la caja con el cobro anterior, el nuevo y la diferencia en porcentaje.
- El aviso al guardar es el de la plantilla: cancelación, nuevo cobro o "Cambios guardados (N).".
- "Cobros al cliente" muestra los cobros con su estado. "Marcar pagado" actúa al instante, muestra "Pagado hoy" y no cuenta como cambio.
- Sin cobros, la tabla se reemplaza por "Aún no hay cobros registrados." y el encabezado dice "Todo al día".
- El resumen suma los montos pagados, el costo de todos los cobros y su diferencia.
- "Impacto en tu ingreso mensual" compara el ingreso con el estado y el cobro guardados contra los elegidos.
- "Otros servicios de <empresa>" enlaza a cada uno con su cobro y su periodo. Sin otros, muestra "Sin otros servicios.".
- Eliminar pide confirmación en el mismo sitio, con los textos de la plantilla.
- Tras eliminar, el aviso "Servicio «<nombre>» eliminado." enlaza a `/services`. Los campos, los botones rápidos, "Marcar pagado" y los botones de guardar, descartar y eliminar quedan `disabled`.

### Estado al navegar

- Alta y edición se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda, pestaña, filtro, "Mostrar cancelados", orden y renovaciones registradas. Su aviso con "Deshacer" se cierra al salir.
- La edición no ve las renovaciones registradas en el listado.

### Accesibilidad

- Tipo, periodicidad y estado son radios nativos. El tipo usa `.crm-option`; periodicidad y estado, `PillRadioGroup`.
- Las pestañas usan `.crm-tabs` y `.crm-tab`, con `role="tab"` y `aria-selected`.
- "Registrar renovación" y "Marcar pagado" llevan un `aria-label` con el servicio o el periodo.
- Los campos con error llevan `aria-invalid="true"` y `aria-describedby`.
- Los `id` de formularios salen de `useId`.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Ampliar lo compartido.** Iconos de mantención, servidor, globo, código, reloj y candado en `components/icons.tsx`. Variante `.crm-tile-dark` en `app/globals.css`, con un token nuevo para su texto secundario.
2. **Crear el modelo.** `features/services/types/service.ts` y `features/services/constants.ts`: tipos con descripción y placeholder, estados con tonos, periodos y avisos.
3. **Crear los datos.** `data/services.ts`, con los 11 servicios.
4. **Crear las utilidades.** `features/services/utils.ts`: montos mensuales, indicadores, búsqueda, textos relativos, próximas renovaciones, formato CLP, lectura de montos, empresa y proyectos de un contacto, otros servicios, resumen de cobros, validación y detección de contraseñas.
5. **Crear la etiqueta y la ruta.** `service-status-badge.tsx`, `app/services/layout.tsx`, `app/services/page.tsx` con el título, y el enlace en `components/app-shell.tsx`.
6. **Crear los indicadores.** `services-summary.tsx` y `upcoming-renewals.tsx`.
7. **Crear la tabla.** `services-table.tsx`, con orden, iconos de tipo, enlaces y textos relativos.
8. **Crear el listado.** `services-list.tsx`, con pestañas, filtros, renovaciones con "Deshacer", vacíos y pie. Conectarlo a la página.
9. **Crear tipo y datos.** `service-type-fields.tsx` y `service-data-fields.tsx`, con nombre, proveedor, cliente y proyecto. Mostrarlos en `app/services/new/page.tsx`.
10. **Crear cobro y costo.** `money-field.tsx` y `service-charge-fields.tsx`, con periodicidad y margen.
11. **Crear renovación y notas.** `service-renewal-fields.tsx` y `service-notes-field.tsx`, con aviso de contraseñas.
12. **Crear el alta.** `service-create-form.tsx` y `service-preview.tsx`, con validación, avisos, "Guardar y agregar otro" y reinicio al navegar.
13. **Crear la ruta de edición.** `app/services/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/services/[id]/not-found.tsx` en español, con `<title>` propio y enlace a `/services`.
14. **Crear la edición.** `service-edit-form.tsx`, con cabecera, botones rápidos, estado, cancelación, pausa, cambio de precio y cambios sin guardar.
15. **Crear los cobros.** `service-charges.tsx`, con "Marcar pagado" y estado vacío.
16. **Crear el panel lateral.** `service-sidebar.tsx`, con resumen, impacto en el ingreso y otros servicios.
17. **Crear la zona de peligro.** `service-danger-zone.tsx`, con confirmación y bloqueo posterior.
18. **Actualizar `CLAUDE.md`.** Añadir `/services`, `features/services`, `data/services.ts` y la regla de dependencias. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 5 a 17 sin carpeta indicada van en `features/services/components/`.
`features/services` puede importar de `features/projects`, de las utilidades de fechas de `features/tickets/utils` y de `data/`. Desde `features/clients` solo importa tipos. Ningún otro dominio importa de `features/services`; `data/services.ts` solo importa sus tipos.
Los pasos 3, 4, 8, 12 y 14 superan 50 líneas por los datos o el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `npx prettier --check app components data features lib` termina sin errores.
- [x] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [x] `prisma/` no cambia.
- [x] Ningún archivo `.tsx` nuevo contiene colores hexadecimales ni estilos `dark:`.
- [x] Ningún archivo de `features/services` importa de `features/clients`, salvo tipos. Ningún archivo fuera de `features/services` y `app/services` importa de `features/services`, salvo los tipos que importa `data/services.ts`.
- [x] Los títulos son "Servicios — CRM TI", "Nuevo servicio — CRM TI", "Editar servicio — CRM TI" y, en un ID inexistente, "Servicio no encontrado — CRM TI".
- [x] El menú muestra 8 elementos y solo "Clientes", "Servicios", "Tickets" y "Proyectos" tienen `href`.
- [x] `/services` muestra $718.250, "9 servicios activos · 4 clientes", $101.579, $616.671, "86% de lo que cobras", 8 y "4 necesitan que las renueves tú".
- [x] Próximas renovaciones muestra 8 servicios; el primero es "Soporte evolutivo app de agenda · bolsa 20 h" con "3 d".
- [x] El listado muestra 10 filas y el pie "Mostrando 10 de 10 servicios". Las pestañas muestran 10, 3, 3, 2 y 2.
- [x] La primera fila es "Soporte evolutivo app de agenda · bolsa 20 h" y la última "Mantención de la tienda online", con "Pausado, no se cobra".
- [x] "Mostrar cancelados" muestra 11 filas y "Hosting compartido antiguo" tachado, con "Cancelado".
- [x] "VPS 4 GB para el sitio" muestra "Margen $3.000 · 12%" en `amber`. "Plan de mantención web · 8 h/mes" muestra "$0 (tu tiempo)".
- [x] Buscar "quillayes" deja 3 filas, buscar "andrea" deja 3, buscar "prj-021" deja 2 y buscar "zzz" muestra "Sin resultados".
- [x] La pestaña "Dominios y SSL" deja 2 filas y tiene `aria-selected="true"`. El filtro "Viña Los Quillayes" deja 3.
- [x] Pulsar "Servicio" ordena por nombre y `aria-sort` pasa a `ascending`; otra pulsación, a `descending`.
- [x] "Registrar renovación" del soporte evolutivo muestra el aviso con la nueva fecha, lo quita de las próximas y deja 7 y "3 necesitan que las renueves tú". "Deshacer" lo restaura.
- [x] Con `services` vacío temporalmente se muestra "Aún no hay servicios" y se oculta la sección de próximas renovaciones.
- [x] La empresa de cada fila enlaza a `/clients/<uuid>` y el código del proyecto a `/projects/<uuid>`.
- [x] El alta muestra "Hosting e infraestructura", "Mensual", la renovación en un mes, "7 días antes", la renovación automática marcada y "Activo".
- [x] Guardar el alta vacía muestra 4 errores y "Revisa los campos marcados antes de guardar.".
- [x] Una renovación de ayer muestra "La fecha ya pasó: usa la próxima renovación." sin intentar guardar.
- [x] Elegir "Mantención" deja el proveedor en "Tú", de solo lectura, y el costo en 0.
- [x] Elegir a Andrea Valdés habilita el proyecto con PRJ-021 y PRJ-024. Cambiar a Javiera Contreras lo vacía y ofrece PRJ-018 y PRJ-025.
- [x] Un cobro de 25.000 y un costo de 22.000 muestran "Margen: $3.000 / mes" y el aviso de margen bajo.
- [x] Un cobro mensual de 45.000 muestra "$718.250 → $763.250" y "+$45.000 al mes". Uno anual de 120.000 muestra "+$10.000 al mes" y la nota de 1/12.
- [x] Escribir "password: abc" en las notas muestra el aviso de contraseña y no impide guardar.
- [x] Guardar un servicio completo muestra el aviso; `/services` sigue mostrando 10 filas.
- [x] "Guardar y agregar otro" conserva cliente y proyecto, vacía el resto y la vista previa parte de $763.250.
- [x] Los 11 servicios abren su edición; `/services/not-found` muestra la página de servicio no encontrado.
- [x] "Hosting del portal de clientes" muestra "Activo", "Vercel Pro", "Andes Logística SpA" con enlace, "Pausar" y "Cancelar servicio".
- [x] Sus cobros muestran 4 filas y "1 cobro pendiente · $35.000". El resumen muestra $100.000, $76.000 y $24.000.
- [x] "Marcar pagado" muestra "Pagado hoy", "Todo al día", $135.000 y $59.000, y "Guardar cambios" sigue `disabled`.
- [x] "Otros servicios de Andes Logística SpA" muestra "Base de datos del portal" y "SSL comodín \*.andeslogistica.example", con enlace.
- [x] "Cancelar servicio" muestra "1 cambio sin guardar: estado (Activo → Cancelado)", la caja de baja con Vercel Pro, $19.000 y $35.000, y "−$35.000 al mes". "Descartar" lo revierte.
- [x] Guardar la cancelación muestra "Servicio cancelado. No olvides darlo de baja en Vercel Pro." y la sección Estado muestra el último día.
- [x] Un cobro de 40.000 muestra "(+14%)" y "+$5.000 al mes". Guardarlo muestra "Nuevo cobro de $40.000 guardado; se aplica desde el <fecha>.".
- [x] Vaciar el nombre y guardar muestra "El nombre no puede quedar vacío." y "Revisa los campos marcados antes de guardar.".
- [x] "Hosting compartido antiguo" muestra solo "Reactivar" y "Último día: <fecha> · Motivo: El cliente migró a su propio servidor".
- [x] "Correo transaccional" muestra "Aún no hay cobros registrados." y "Todo al día".
- [x] Eliminar requiere dos pulsaciones; después todo queda deshabilitado y el aviso enlaza a `/services`.
- [x] Un borrador de alta o edición desaparece al volver por un enlace y se conserva al volver con atrás.
- [x] El listado conserva búsqueda, pestaña, filtro, "Mostrar cancelados", orden y renovaciones al volver; el aviso no.
- [x] Las flechas del teclado cambian tipo, periodicidad y estado.
- [x] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [x] Con Playwright, las pantallas de `/services`, `/projects`, `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px.

## Decisiones

- **Sí:** tres pantallas, el menú y los enlaces hacia clientes y proyectos. Lo eligió el usuario; mismo patrón que el SPEC 05.
- **No:** paneles de servicios en clientes y proyectos. No están diseñados y tocarían tres dominios.
- **Sí:** `clientId` de un contacto, con la empresa derivada. Coincide con `Project.clientId` y con `services.id_client`; lo eligió el usuario.
- **No:** guardar la empresa como texto, como en la plantilla. No coincide con la base y no permite enlazar al cliente.
- **Sí:** selector de contactos en el alta. Un selector de empresas sería ambiguo con empresas de dos contactos.
- **Sí:** historial de cobros como `charges[]`, con un resumen calculado. La plantilla sumaba a mano seis cobros invisibles; lo eligió el usuario.
- **Sí:** "Pagado al proveedor" suma el costo de todos los cobros, pagados o no. El proveedor cobra cada periodo aunque el cliente no haya pagado.
- **Sí:** ingreso mensual y otros servicios calculados desde `data/services.ts`. La plantilla fijaba 718.250 y dos filas; el cálculo da lo mismo y sigue cuadrando si cambian los datos.
- **Sí:** "Registrar renovación" local con "Deshacer", +30 o +365 días. Mismo patrón que el cambio de estado en tickets; lo eligió el usuario.
- **No:** renovar por mes de calendario. Los desfases están en días y la diferencia no se nota en una maqueta.
- **No:** cambiar el cliente o el tipo en la edición. No están en `ServicioEditar`; lo confirmó el usuario.
- **Sí:** guardar el último día y el motivo de la cancelación y mostrarlos después. La plantilla los pedía y luego los perdía; lo eligió el usuario.
- **Sí:** notas editables en la edición. La plantilla las pedía en el alta pero no permitía verlas después.
- **Sí:** proveedor "Tú" de solo lectura también en la edición de mantenciones. Mantiene la regla del alta.
- **Sí:** "desde <mes año>" calculado con `createdDaysAgo`. La plantilla fijaba "abr 2026".
- **Sí:** "Cargando…" en las tres pantallas. Las fechas y los periodos dependen del día del navegador.
- **Sí:** datos completos solo en "Hosting del portal de clientes" y cancelación en "Hosting compartido antiguo". Mismo patrón que los SPEC 04 y 05.
- **Sí:** sin código visible de servicio. No existe en la plantilla ni en la base.
- **Sí:** bloquear tras eliminar. Es la regla de los SPEC 03, 04 y 05.
- **No:** estado compartido entre pantallas. Sería código desechable, como en los specs anteriores.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El listado usa la fecha y rompe el prerender con `cacheComponents`. | Calcular todo con `useToday` en el navegador y mostrar "Cargando…" antes; compilar al cerrar el paso 8. |
| Redondear los anuales a mes da totales distintos a los del criterio. | Sumar sin redondear y redondear solo al formatear; comprobar $101.579 y $616.671. |
| `features/services` importa de `features/projects` y crea un ciclo. | Importar módulos concretos y que ningún dominio importe de servicios. |
| La lectura de montos con separador de miles mueve el cursor al escribir. | Probar al cerrar el paso 10 escribiendo y borrando en medio del número. |
| Los avisos hacen creer que los datos persisten. | No desplegarla como producto hasta conectar la base. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Cambios en el esquema de la base.
- Paneles de servicios en clientes y proyectos.
- Alta de servicio desde un cliente o un proyecto.
- Cambiar el cliente o el tipo en la edición.
- Avisos reales de renovación y cobros automáticos.
- Conversión de monedas.
- Estado compartido entre pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
