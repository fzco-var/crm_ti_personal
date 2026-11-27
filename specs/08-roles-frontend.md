# SPEC 08 — Frontend de roles y permisos

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 04, SPEC 07
> **Fecha:** 2026-11-27
> **Objetivo:** Que el listado, el alta y la edición de roles con su matriz de permisos se puedan usar en `/roles`, con datos de ejemplo y sin backend.

## Por qué existe este spec

Es el segundo módulo del grupo "Configuración" del menú y cierra lo que el SPEC 07 dejó fuera.
Hasta ahora los roles eran datos fijos dentro de `features/users`, con un `permissionCount` sin detalle.
Este spec les da dominio propio, permisos reales por módulo y acción, y sus tres pantallas.

La referencia son `Roles`, `RolCrear` y `RolEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- `/roles`: resumen, búsqueda, filas con permisos y usuarios, permisos desplegables, "Duplicar" y eliminar con "Deshacer", y estados vacíos.
- `/roles/new`: nombre, clave generada, descripción, plantillas de permisos, matriz, aviso de permisos críticos y resumen.
- `/roles/[id]`: cabecera con fechas, cambios sin guardar, matriz con cambios marcados, "Restaurar permisos", panel de cambios, usuarios con este rol y eliminación.
- Reglas de los roles del sistema y bloqueo del Administrador.
- Página de rol no encontrado.
- Dominio nuevo `features/roles`, con `Role` movido desde `features/users`.
- `data/roles.ts` con los 4 roles de la plantilla y sus permisos.
- Enlace "Roles y permisos" en el menú y enlace "Crear un rol nuevo" en el selector de rol de usuarios.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia.
- Cambios en `prisma/`.
- Aplicar los permisos: ocultar o bloquear pantallas según el rol del usuario.
- Módulo de reportes: "Reportes" solo existe como fila de la matriz.
- Pantalla de edición para los roles duplicados en el listado.
- Filtro del listado de usuarios por rol desde la URL (`/users?role=`).
- Reasignar usuarios de un rol desde `/roles`.
- Tono elegible por rol.
- Estado compartido entre pantallas.

## Modelo de datos

`features/roles/types/role.ts` reemplaza a `features/users/types/role.ts`:

```ts
export type PermissionModule =
  | "clientes"
  | "servicios"
  | "tickets"
  | "proyectos"
  | "reportes"
  | "usuarios";
export type PermissionAction = "ver" | "crear" | "editar" | "eliminar" | "exportar";
export type PermissionKey = `${PermissionModule}.${PermissionAction}`; // "tickets.editar"

export interface Role {
  id: string; // UUID
  key: string; // "solo_lectura", como rol.intern_key; no cambia al renombrar
  name: string; // "Solo lectura", hasta 20 caracteres
  description: string; // puede ser ""
  system: boolean; // no se puede eliminar ni renombrar
  permissions: PermissionKey[]; // sin repetidos
  createdDaysAgo: number;
  updatedDaysAgo: number; // última modificación, siempre por Martín Vidal
}

// Valores editables del alta y la edición.
export interface RoleFormValues {
  name: string;
  description: string;
  permissions: PermissionKey[];
}
```

`features/roles/constants.ts` exporta:

- `PERMISSION_MODULES`: los 6 módulos con `label` y `desc` de la plantilla, en su orden ("Usuarios y roles" para `usuarios`).
- `PERMISSION_ACTIONS`: las 5 acciones con `label`, en su orden.
- `PERMISSION_TOTAL = 30`, calculado como módulos × acciones. Sale de `features/users/constants.ts`.
- `ROLE_TONES`, por `key`. Sale de `features/users/constants.ts`.
- `PERMISSION_PRESETS`: En blanco, Solo lectura, Técnico y Administrador, con `label`, `desc` y permisos de la plantilla.
- `ADMIN_ROLE_KEY = "administrador"`.

Reglas:

- La cantidad de permisos es `permissions.length`. Sustituye a `permissionCount`.
- El resumen de un módulo es "sin acceso" con 0, "total" con 5 y "N/5" en el listado o "N de 5" en el alta.
- La clave se genera del nombre: minúsculas, sin tildes, cada tramo que no sea letra o dígito pasa a `_`, sin `_` al inicio ni al final. Con nombre vacío se muestra "se_genera_del_nombre".
- Un rol se puede eliminar si no es del sistema y no tiene usuarios.
- Los usuarios de un rol son los de `data/users.ts` con su `roleId`, en ese orden, activos o no.
- Marcar una acción distinta de "Ver" marca "Ver" en su módulo. Quitar "Ver" quita todas las acciones del módulo. Vale en alta y edición.
- "Todo" marca las 5 acciones del módulo, o las quita si ya estaban todas.
- Los permisos críticos son `usuarios.editar` y `usuarios.eliminar`.
- El Administrador (`ADMIN_ROLE_KEY`) siempre tiene los 30 permisos y su matriz no se edita.
- Un nombre está repetido si otro rol lo tiene, sin distinguir mayúsculas ni tildes. En la edición se excluye el propio rol.
- Una clave está repetida si otro rol de `data/roles.ts` la tiene. Solo se valida en el alta, porque la edición no cambia la clave.

### Roles de ejemplo

`data/roles.ts` exporta los 4 roles de `Roles.dc.html`, en este orden.
Los 3 primeros conservan sus UUID actuales; el cuarto lleva uno nuevo fijo.
Las descripciones y los permisos son los de la plantilla.

| `key` | `name` | `system` | Permisos | Tono | `createdDaysAgo` | `updatedDaysAgo` |
|---|---|---|---|---|---|---|
| `administrador` | Administrador | `true` | 30 | `orange` | 178 | 44 |
| `tecnico` | Técnico | `false` | 10 | `blue` | 178 | 44 |
| `solo_lectura` | Solo lectura | `true` | 6 | `gray` | 178 | 44 |
| `soporte_externo` | Soporte externo | `false` | 4 | `purple` | 60 | 60 |

- Técnico: `clientes.ver`; `servicios` ver, crear y editar; `tickets` ver, crear, editar y exportar; `proyectos` ver y editar.
- Solo lectura: `ver` en los 6 módulos.
- Soporte externo: `servicios.ver`; `tickets` ver, crear y editar.
- Con los usuarios del SPEC 07, Administrador tiene 1 usuario, Técnico 3, Solo lectura 2 y Soporte externo 0.
- Un rol sin tono en `ROLE_TONES`, como una copia, usa `gray`.

### Cambios en `features/users`

- `Role` se importa desde `features/roles/types/role`. Se borra `features/users/types/role.ts`.
- `role-badge.tsx` pasa a `features/roles/components/`. `findRoleById`, `getRoleTone` y `getRoleName` pasan a `features/roles/utils.ts`.
- `PERMISSION_TOTAL` y `ROLE_TONES` salen de `features/users/constants.ts`.
- `role-picker.tsx` muestra "N de 30 permisos" con la cantidad calculada y el enlace "Crear un rol nuevo" a `/roles/new`.
- El selector y los filtros de rol muestran los 4 roles. El filtro "Soporte externo" muestra 0.

### Tonos

| Valor | Tono |
|---|---|
| Permiso añadido (borde y signo "+") | `green` |
| Permiso quitado (borde y signo "−") | `red` |
| Aviso de permisos críticos e impacto en usuarios | `amber` |

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Modelo `rol` |
|---|---|
| `permissions` | No existe; no hay tabla de permisos |
| `system` | No existe |
| `createdDaysAgo`, `updatedDaysAgo` | No existen |
| `description` obligatorio, puede ser "" | `description` opcional, `VarChar(255)` |
| `key` | `intern_key`, `VarChar(50)` |
| `name` con límite de 20 | `rol`, `VarChar(20)` |

## Comportamiento

### Armazón y enlaces

- "Roles y permisos" lleva a `/roles` y tiene `aria-current="page"` en las tres pantallas.
- La miga de pan empieza por "Configuración", sin enlace.
- Los enlaces a un rol llevan a `/roles/<uuid>`. Los de un usuario, a `/users/<uuid>`.

### Fechas

- "Hoy" se calcula en el navegador con `useToday`.
- La edición muestra "Cargando rol…" hasta conocer la fecha. El listado y el alta no usan fechas y no esperan.
- Las fechas se muestran con `es-CL`, como `02 jun 2026`, con las utilidades de `features/tickets/utils`. Con 0 días se muestra "hoy".

### Listado

- El orden es el de `data/roles.ts`. No hay orden por columnas ni paginación.
- El resumen es "4 roles · 2 del sistema, 2 personalizados", con singular cuando la cantidad es 1.
- La búsqueda cubre nombre y clave, sin distinguir mayúsculas ni tildes.
- Cada fila muestra la etiqueta con tono, la clave, la etiqueta "Sistema" si corresponde, la descripción, la barra y "N/30", los avatares de hasta 4 usuarios y "Sin usuarios", "1 usuario" o "N usuarios".
- El avatar de Martín Vidal es oscuro.
- "Ver permisos" despliega los 6 módulos con su resumen y sus 5 acciones; las ausentes van tachadas. Pasa a "Ocultar permisos" y lleva `aria-expanded`. Solo hay una fila abierta; Técnico empieza abierta.
- Un rol personalizado con usuarios muestra en el despliegue "Para eliminar este rol, primero reasigna a sus usuarios a otro rol desde Usuarios.", con enlace a `/users`.
- Eliminar está `disabled` si el rol no se puede eliminar. Su `title` es "Los roles del sistema no se pueden eliminar" o "Reasigna a sus N usuarios antes de eliminarlo".
- Eliminar quita el rol al instante y muestra "Rol «<nombre>» eliminado." con "Deshacer".
- "Duplicar" inserta debajo "Copia de <nombre>", con clave `<clave>_copia`, no del sistema, sin usuarios y con los mismos permisos. Muestra "Creaste «Copia de <nombre>».", con "Deshacer".
- Las copias no tienen lápiz de edición, porque no tienen página. Se pueden duplicar y eliminar.
- "Deshacer" revierte solo el último cambio y muestra "Cambio deshecho.".
- El vacío de búsqueda es el de la plantilla: "Sin resultados" y "Ningún rol coincide con «<texto>».".
- El pie dice "Mostrando N de M roles".

### Alta

- Empieza con nombre y descripción vacíos, 0 permisos y "En blanco" con `aria-pressed="true"`.
- Elegir una plantilla reemplaza los permisos. Tocar la matriz deja todas las plantillas con `aria-pressed="false"`.
- La clave se muestra en vivo, de solo lectura.
- Los errores aparecen al primer intento de guardar, en este orden de prioridad:
  - Nombre vacío: "Ponle un nombre al rol.".
  - Más de 20 caracteres: "Usa 20 caracteres o menos.".
  - Nombre repetido: "Ya existe un rol con ese nombre.".
  - Clave vacía: "El nombre necesita al menos una letra o un número.".
  - Clave repetida: "Ya existe un rol con la clave <clave>.".
- Con un permiso crítico marcado se muestra el aviso de la plantilla.
- El resumen muestra el nombre ("Rol sin nombre" si falta), "N / 30" con barra, el resumen de cada módulo y "Ninguno todavía. Podrás asignarlo desde Usuarios.".
- "Guardar rol" muestra "Rol <nombre> creado con N permisos.", con el enlace "Ver listado" a `/roles`. Conserva los valores y no añade el rol al listado.
- Cambiar cualquier campo oculta el aviso de creación.

### Edición

- La cabecera muestra "Editar rol", la etiqueta con el nombre guardado, "Sistema" si corresponde y "Creado el <fecha> · última modificación <hoy|fecha> por Martín Vidal".
- La clave lleva el candado y "No cambia al renombrar, para no romper el backend.".
- En un rol del sistema el nombre es de solo lectura, con "Los roles del sistema no se pueden renombrar.".
- Los cambios cuentan por nombre, descripción y permisos. El aviso dice "Cambios sin guardar: nombre · descripción · N permisos añadidos, M quitados", en singular con 1, y lleva "Descartar".
- "Guardar cambios" está `disabled` si no hay cambios. "Descartar" vuelve a los valores guardados.
- Nombre y descripción cambiados muestran "· modificado" o "· modificada".
- Los errores de nombre son los del alta salvo la clave, con "El nombre no puede quedar vacío." para el vacío.
- Las casillas cambiadas llevan borde `green` si se añadieron y `red` si se quitaron.
- "Restaurar permisos" vuelve a los permisos guardados y está `disabled` sin cambios de permisos.
- En el Administrador las casillas están `disabled`, no hay "Restaurar permisos" y se muestra "El rol Administrador siempre tiene acceso total, así nunca te quedas fuera del CRM.".
- "Cambios en permisos" muestra "<antes> → <ahora> / 30" con barra, "Sin cambios todavía." o hasta 6 cambios con "+" o "−", y "y N más" si hay más.
- Con cambios de permisos y usuarios, se muestra "Afecta a N usuarios. Los cambios se aplican en su siguiente acción, sin cerrar sesión.".
- Al guardar, el aviso es "Rol «<nombre>» actualizado." o "Rol «<nombre>» actualizado. Afecta a N usuarios.". Los valores pasan a ser la referencia y la modificación pasa a "hoy".
- "Usuarios con este rol" muestra la cantidad y cada usuario con iniciales, nombre y "@usuario", enlazado a su edición. Sin usuarios, "Nadie tiene este rol todavía. Asígnalo desde Usuarios.", con enlace a `/users`.

### Eliminación

- El texto es "Es un rol del sistema y no se puede eliminar.", "Primero reasigna a sus N usuarios a otro rol." o "Nadie lo usa, así que puedes eliminarlo sin afectar a nadie.".
- "Eliminar rol" está `disabled` si el rol no se puede eliminar.
- La primera pulsación pide confirmación en el mismo sitio, con "Sí, eliminar" y "Cancelar".
- Tras eliminar, el aviso "Rol «<nombre>» eliminado." enlaza a `/roles`. Los campos, las casillas y todos los botones, salvo "Volver", quedan `disabled`.

### Estado al navegar

- Alta y edición se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda, fila abierta, copias y eliminaciones. Su aviso con "Deshacer" se cierra al salir.
- La edición y las pantallas de usuarios no ven las copias, eliminaciones ni cambios guardados.

### Accesibilidad

- Las plantillas son botones con `aria-pressed`, dentro de un grupo con `aria-label` "Plantillas de permisos".
- La matriz es una tabla con `th scope="col"` y `th scope="row"`. Cada casilla es un `checkbox` nativo con `aria-label` "<Acción> en <Módulo>" o "Todos los permisos de <Módulo>".
- La tabla se desplaza en horizontal dentro de su contenedor; la página no.
- Las barras de permisos son `aria-hidden`; el texto "N/30" es visible.
- "Duplicar", el lápiz y eliminar llevan `aria-label` "Duplicar rol <nombre>", "Editar rol <nombre>" y "Eliminar rol <nombre>".
- Los campos con error llevan `aria-invalid="true"` y `aria-describedby`.
- Los `id` de formularios salen de `useId`.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Crear el modelo.** `features/roles/types/role.ts` y `features/roles/constants.ts`. Sin consumidores todavía.
2. **Mover el modelo de usuarios.** `features/users` importa `Role` de `features/roles`; se borra `features/users/types/role.ts` y salen `PERMISSION_TOTAL` y `ROLE_TONES` de `features/users/constants.ts`.
3. **Actualizar los datos.** `data/roles.ts` con los 4 roles, `system`, `permissions` y fechas, y claves nuevas.
4. **Crear las utilidades.** `features/roles/utils.ts`: búsqueda, tono, nombre, usuarios de un rol, cantidad y resumen por módulo, clave generada, reglas de "Ver" y "Todo", plantillas, diferencias, eliminable y validación. Mover ahí `findRoleById`, `getRoleTone` y `getRoleName`.
5. **Mover la etiqueta y ajustar usuarios.** `role-badge.tsx` a `features/roles/components/`. `role-picker.tsx` con la cantidad calculada y "Crear un rol nuevo". Comprobar que `/users` sigue funcionando.
6. **Crear la ruta y el menú.** `app/roles/layout.tsx`, `app/roles/page.tsx` con el título, y el `href` de "Roles y permisos" en `components/app-shell.tsx`.
7. **Crear las filas.** `role-row.tsx`, con etiqueta, permisos, avatares y despliegue por módulos.
8. **Crear el listado.** `roles-list.tsx`, con resumen, búsqueda, "Duplicar", eliminar con "Deshacer", vacío y pie. Conectarlo a la página.
9. **Crear la matriz.** `permission-matrix.tsx`, con "Todo", reglas de "Ver", bordes de cambio y estado `disabled`.
10. **Crear las plantillas.** `permission-presets.tsx`, con `aria-pressed`.
11. **Crear el alta.** `app/roles/new/page.tsx`, `role-create-form.tsx` y `role-summary.tsx`, con validación, aviso crítico, aviso de creación y reinicio al navegar.
12. **Crear la ruta de edición.** `app/roles/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/roles/[id]/not-found.tsx` en español, con `<title>` propio y enlace a `/roles`.
13. **Crear la edición.** `role-edit-form.tsx`, con cabecera, datos, rol del sistema, Administrador bloqueado, "Restaurar permisos" y cambios sin guardar.
14. **Crear el panel lateral.** `role-changes.tsx` y `role-users.tsx`, con diferencias, impacto y usuarios enlazados.
15. **Crear la zona de peligro.** `role-danger-zone.tsx`, con confirmación y bloqueo posterior.
16. **Actualizar `CLAUDE.md`.** Añadir `/roles`, `features/roles`, el nuevo `data/roles.ts` y la regla de dependencias entre roles y usuarios. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 7 a 15 sin carpeta indicada van en `features/roles/components/`.
`features/roles` puede importar de `features/users/utils` (nombre completo) y `features/users/constants` (`CURRENT_USER_ID`), de las utilidades de fechas de `features/tickets/utils`, de `components/`, de `lib/` y de `data/`.
`features/users` puede importar de `features/roles` sus tipos, constantes, utilidades y `role-badge`. Ningún otro dominio importa de `features/roles`. Importar siempre el módulo concreto, nunca un índice, para no crear ciclos.
`data/roles.ts` y `data/users.ts` solo importan sus tipos.
Los pasos 3, 8, 11 y 13 superan 50 líneas por los datos o el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features lib` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` no cambia.
- [ ] Ningún archivo `.tsx` nuevo contiene colores hexadecimales ni estilos `dark:`.
- [ ] `features/users/types/role.ts` no existe y nada contiene `permissionCount`.
- [ ] Ningún archivo fuera de `features/roles`, `features/users` y `app/roles` importa de `features/roles`, salvo el tipo que importa `data/roles.ts`. `features/roles` solo importa de `features/users/utils` y `features/users/constants`.
- [ ] Los títulos son "Roles y permisos — CRM TI", "Crear rol — CRM TI", "Editar rol — CRM TI" y, en un ID inexistente, "Rol no encontrado — CRM TI".
- [ ] El menú muestra 8 elementos y solo "Clientes", "Servicios", "Tickets", "Proyectos", "Usuarios" y "Roles y permisos" tienen `href`.
- [ ] `/roles` muestra "4 roles · 2 del sistema, 2 personalizados", 4 filas y "Mostrando 4 de 4 roles".
- [ ] Las filas muestran 30/30, 10/30, 6/30 y 4/30, y "1 usuario", "3 usuarios", "2 usuarios" y "Sin usuarios".
- [ ] Administrador y Solo lectura llevan "Sistema"; Técnico y Soporte externo no.
- [ ] Técnico empieza abierta, con "Ocultar permisos", `aria-expanded="true"`, Clientes "1/5", Tickets "4/5", Reportes "sin acceso" y el aviso de reasignar.
- [ ] Abrir Administrador cierra Técnico y muestra "total" en los 6 módulos.
- [ ] Buscar "lectura" deja 1 fila, buscar "soporte_externo" deja 1, buscar "TECNICO" deja 1 y buscar "zzz" muestra "Sin resultados".
- [ ] Eliminar está `disabled` en Administrador, Técnico y Solo lectura, y habilitado en Soporte externo.
- [ ] Eliminar Soporte externo deja 3 filas y "Rol «Soporte externo» eliminado."; "Deshacer" lo restaura y muestra "Cambio deshecho.".
- [ ] "Duplicar" en Técnico inserta "Copia de Técnico" debajo, con `tecnico_copia`, 10/30, "Sin usuarios", sin lápiz y con eliminar habilitado. El resumen pasa a "5 roles · 2 del sistema, 3 personalizados".
- [ ] El alta muestra "En blanco" con `aria-pressed="true"`, "0 / 30", "se_genera_del_nombre" y "Rol sin nombre".
- [ ] Guardar el alta vacía muestra "Ponle un nombre al rol.".
- [ ] "Técnico de soporte" genera `tecnico_de_soporte`. "Técnico" muestra "Ya existe un rol con ese nombre." y "Tecnico!" muestra "Ya existe un rol con la clave tecnico." al guardar.
- [ ] Un nombre de 21 caracteres muestra "Usa 20 caracteres o menos.". "!!!" muestra "El nombre necesita al menos una letra o un número.".
- [ ] La plantilla Técnico deja "10 / 30". Marcar "Eliminar en Clientes" deja "Ver en Clientes" marcado y ninguna plantilla pulsada.
- [ ] Quitar "Ver en Tickets" deja Tickets en "sin acceso". "Todos los permisos de Proyectos" marca sus 5 casillas y otra pulsación las quita.
- [ ] Marcar "Editar en Usuarios y roles" muestra el aviso de permisos críticos.
- [ ] Guardar un rol válido muestra "Rol <nombre> creado con N permisos." y "Ver listado"; `/roles` sigue mostrando 4 filas.
- [ ] Los 4 roles abren su edición; `/roles/not-found` muestra la página de rol no encontrado.
- [ ] Técnico muestra "Creado el <fecha> · última modificación <fecha> por Martín Vidal", la clave `tecnico` con candado y 3 usuarios con enlace a `/users/<uuid>`.
- [ ] Quitar "Crear en Servicios" muestra el borde `red`, "Cambios sin guardar: 0 permisos añadidos, 1 quitado", "10 → 9 / 30", "− Crear en Servicios" y "Afecta a 3 usuarios.…".
- [ ] "Restaurar permisos" lo revierte y queda `disabled`. "Descartar" revierte nombre, descripción y permisos.
- [ ] Guardar un cambio de permisos en Técnico muestra "Rol «Técnico» actualizado. Afecta a 3 usuarios.", "última modificación hoy" y "Guardar cambios" `disabled`.
- [ ] Renombrar Técnico a "Solo lectura" y guardar muestra "Ya existe un rol con ese nombre.". Vaciarlo muestra "El nombre no puede quedar vacío.".
- [ ] Administrador muestra la nota de acceso total, las 36 casillas `disabled`, sin "Restaurar permisos", el nombre de solo lectura y "Es un rol del sistema y no se puede eliminar.".
- [ ] Solo lectura tiene el nombre de solo lectura y la matriz editable.
- [ ] Soporte externo muestra "Nadie tiene este rol todavía." y "Nadie lo usa, así que puedes eliminarlo sin afectar a nadie.".
- [ ] Eliminar Soporte externo requiere dos pulsaciones; después todo queda deshabilitado salvo "Volver" y el aviso enlaza a `/roles`.
- [ ] En `/users/new` el selector muestra 4 roles, "4 de 30 permisos" en Soporte externo y "Crear un rol nuevo" lleva a `/roles/new`.
- [ ] Los filtros de `/users` muestran Todos 6, Administrador 1, Técnico 3, Solo lectura 2 y Soporte externo 0.
- [ ] Un borrador de alta o edición desaparece al volver por un enlace y se conserva al volver con atrás.
- [ ] El listado conserva búsqueda, fila abierta y copias al volver; el aviso no.
- [ ] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [ ] Con Playwright, las pantallas de `/roles`, `/users`, `/services`, `/projects`, `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px.

## Decisiones

- **Sí:** dominio `features/roles`, con `Role` movido desde `features/users`. Separa dominios como el resto del proyecto; lo eligió el usuario.
- **No:** las pantallas de roles dentro de `features/users`. Mezclaría dos dominios en una carpeta.
- **Sí:** dependencia en los dos sentidos entre roles y usuarios, con módulos concretos. Es el patrón de proyectos y tickets.
- **Sí:** `permissions` como lista de claves `"módulo.acción"`, con la cantidad calculada. Simple de comparar para las diferencias; lo eligió el usuario.
- **No:** mapa por módulo. Más legible en los datos, pero más código para comparar.
- **Sí:** los 4 roles de la plantilla, con "Soporte externo". Permite probar la eliminación sin inventar datos; lo eligió el usuario.
- **Sí:** los 6 módulos de la plantilla, con "Reportes". Mantiene el total de 30 y los conteos del SPEC 07; lo eligió el usuario.
- **Sí:** claves de la plantilla (`solo_lectura`, `soporte_externo`). Siguen la regla de generación del alta; lo eligió el usuario.
- **No:** conservar `lectura`. No seguiría la regla del alta.
- **Sí:** "Duplicar" y eliminar locales en el listado, con "Deshacer". Mismo patrón que "Registrar renovación"; lo eligió el usuario.
- **Sí:** las copias no tienen lápiz y su aviso no invita a editarlas. No tienen UUID ni página.
- **Sí:** validar nombre repetido, clave repetida y 20 caracteres. `rol.rol` es `VarChar(20)`; lo eligió el usuario.
- **No:** exigir al menos un permiso. Un rol "En blanco" es válido; lo decidió el usuario.
- **Sí:** clave vacía como error propio. Un nombre solo con símbolos generaría una clave vacía.
- **Sí:** menú, "Crear un rol nuevo" y usuarios enlazados. Cierran lo diferido en el SPEC 07; lo eligió el usuario.
- **No:** `/users?role=<uuid>`. Toca el listado de usuarios sin necesidad; queda para otro spec.
- **Sí:** creación y última modificación como desfases en días, con "por Martín Vidal" fijo. Mismo patrón que los specs anteriores; lo eligió el usuario.
- **Sí:** confirmación en el sitio para eliminar, con bloqueo posterior. Es la regla de servicios; lo eligió el usuario.
- **No:** confirmación escrita. Un rol eliminable no tiene usuarios, así que el riesgo es menor que borrar una cuenta.
- **Sí:** el alta empieza en "En blanco". Evita crear un rol con permisos que nadie eligió; lo eligió el usuario.
- **Sí:** las dos reglas de "Ver" en alta y edición. Nunca existe un permiso sin "Ver"; lo eligió el usuario.
- **Sí:** Administrador con matriz bloqueada y roles del sistema sin renombrar. Es la regla de la plantilla y evita quedarse fuera del CRM.
- **Sí:** copias y roles nuevos en `gray`. No hay forma de elegir tono y `ROLE_TONES` va por clave.
- **No:** aplicar los permisos en las pantallas. Requiere sesión real; va con la autenticación.
- **No:** estado compartido entre pantallas. Sería código desechable, como en los specs anteriores.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Mover `Role` y la etiqueta rompe las pantallas de usuarios. | Hacerlo en los pasos 2 y 5, antes de crear pantallas, y comprobar `/users` y `npx tsc --noEmit` al cerrar cada uno. |
| La dependencia entre roles y usuarios crea un ciclo de módulos. | Importar módulos concretos; `features/roles` solo usa `features/users/utils` y `features/users/constants`. |
| Los criterios del SPEC 07 cambian con el cuarto rol. | El cambio está descrito en "Cambios en `features/users`" y verificado en los criterios de este spec. |
| La edición usa la fecha y rompe el prerender con `cacheComponents`. | Calcular con `useToday` en el navegador y mostrar "Cargando rol…" antes; compilar al cerrar el paso 13. |
| La matriz desborda en móvil. | Desplazamiento horizontal dentro de su contenedor; comprobarlo a 390 px. |
| Los avisos de creación y guardado hacen creer que los permisos se aplican. | No desplegarla como producto hasta conectar la base y la autenticación. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia.
- Cambios en el esquema de la base.
- Aplicar los permisos en las pantallas.
- Módulo de reportes.
- Edición de roles duplicados en el listado.
- Filtro de usuarios por rol desde la URL.
- Reasignar usuarios desde `/roles`.
- Tono elegible por rol.
- Estado compartido entre pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
