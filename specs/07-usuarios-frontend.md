# SPEC 07 — Frontend de usuarios

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 04
> **Fecha:** 2026-11-27
> **Objetivo:** Que el listado, el alta y la edición de usuarios del CRM se puedan usar en `/users`, con roles fijos de ejemplo y sin backend.

## Por qué existe este spec

Es el primer módulo del grupo "Configuración" del menú.
Los usuarios son las personas que entran al CRM, cada una con un rol que define lo que puede hacer.

La referencia son `Usuarios`, `UsuarioNuevo` y `UsuarioEditar` (`.dc.html`), en `references/CRM-TI-templates/templates/`.
Sus textos, validaciones y estados valen para todo lo que este spec no cambia.

## Alcance

**Incluye:**

- `/users`: resumen, búsqueda, filtro por rol, "Restablecer" contraseña, etiqueta de desactivado y estados vacíos.
- `/users/new`: datos, cuenta con usuario sugerido, contraseña inicial con fuerza y generación, cambio obligatorio, rol y vista previa.
- `/users/[id]`: cambios sin guardar, datos y cuenta, contraseña temporal, enlace de restablecimiento, rol, panel de seguridad, desactivación y eliminación.
- Protección de la cuenta propia (Martín Vidal).
- Página de usuario no encontrado.
- Tipos en `features/users/types/`, roles en `data/roles.ts` y usuarios en `data/users.ts`.
- Enlace "Usuarios" en el menú.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación, login y persistencia.
- Cambios en `prisma/`.
- Pantallas de roles y permisos (`Roles`, `RolCrear`, `RolEditar`), el enlace "Roles y permisos" del menú y el enlace "Crear un rol nuevo".
- Envío real de correos, cifrado de contraseñas y 2FA real.
- Menú "Más acciones" (···) en las filas.
- Asignar tickets o proyectos a usuarios.
- Cambiar el usuario de la tarjeta del menú lateral.
- Estado compartido entre pantallas.

## Modelo de datos

`features/users/types/role.ts`:

```ts
export interface Role {
  id: string; // UUID
  key: string; // "administrador", como rol.intern_key
  name: string; // "Administrador"
  description: string;
  permissionCount: number; // de PERMISSION_TOTAL
}
```

`features/users/types/user.ts`:

```ts
export interface UserSession {
  device: string; // "Chrome · macOS"
  ip: string;
  lastSeenDaysAgo: number; // 0 es "activa ahora"
}

export interface UserActivity {
  text: string; // "Inició sesión"
  daysAgo: number;
}

export interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  username: string; // sin "@"
  email: string;
  roleId: string; // en data/roles.ts
  active: boolean;
  passwordTemporary: boolean;
  passwordChangedDaysAgo: number;
  twoFactorActive: boolean; // false es "Pendiente"
  sessions: UserSession[];
  activity: UserActivity[]; // de la más reciente a la más antigua
  createdDaysAgo: number;
  lastAccessDaysAgo: number | null; // null es "nunca"
}

// Valores editables; el alta admite `roleId` vacío.
export interface UserFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: string;
}

export interface UserCreateValues extends UserFormValues {
  password: string;
  forcePasswordChange: boolean;
}
```

`features/users/constants.ts` exporta `PERMISSION_TOTAL = 30`, los tonos por `key` de rol, los niveles de fuerza de contraseña y `CURRENT_USER_ID`, el UUID de Martín Vidal.

Reglas:

- El nombre completo es `firstName + " " + lastName`. Las iniciales salen de `getInitials`.
- El nombre de usuario válido cumple `/^[a-z0-9._]{3,24}$/`. El email válido cumple `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`.
- Un nombre de usuario o un email está repetido si otro usuario de `data/users.ts` lo tiene, sin distinguir mayúsculas. En la edición se excluye el propio usuario.
- La contraseña necesita al menos 12 caracteres.
- La fuerza va de 0 a 4, con las reglas de la plantilla: 8 o más caracteres, 12 o más, 3 clases de caracteres, y 14 o más con las 4 clases.
- La contraseña generada tiene 16 caracteres del alfabeto de la plantilla, elegidos con `crypto.getRandomValues`, con al menos una minúscula, una mayúscula, un dígito y un símbolo. Siempre es "Fuerte".
- El usuario sugerido es la inicial del nombre más la primera palabra del apellido, en minúsculas, sin tildes y sin otros caracteres. Deja de sugerirse al editar el campo.
- La antigüedad de la contraseña es "hoy" con 0 días, "hace N días" hasta 13, "hace N semanas" hasta 29, "hace N meses" hasta 364 y "hace N años" después, en singular con 1.

### Roles de ejemplo

`data/roles.ts` exporta los 3 roles de la plantilla, con UUID fijos, en este orden:

| `key` | `name` | `permissionCount` | Tono |
|---|---|---|---|
| `administrador` | Administrador | 30 | `orange` |
| `tecnico` | Técnico | 10 | `blue` |
| `lectura` | Solo lectura | 6 | `gray` |

Las descripciones son las de la plantilla.

### Usuarios de ejemplo

`data/users.ts` exporta los 6 usuarios de `Usuarios.dc.html`, con UUID fijos y en su orden.
El nombre, el usuario, el email y el rol son los de esa plantilla.

| Usuario | `passwordChangedDaysAgo` | Otros datos |
|---|---|---|
| Martín Vidal | 12 | `CURRENT_USER_ID` |
| Camila Rojas | 60 | 2 sesiones y 3 actividades |
| Matías Fuentes | 21 | |
| Valentina Soto | 3 | `passwordTemporary: true`, `twoFactorActive: false`, `lastAccessDaysAgo: null`, sin sesiones |
| Diego Muñoz | 150 | `active: false`, sin sesiones |
| Fernanda Pérez | 30 | |

- Camila Rojas lleva `createdDaysAgo: 176` y `lastAccessDaysAgo: 0`. Sus sesiones son "Chrome · macOS", 203.0.113.24, con 0 días, y "Safari · iPhone", 198.51.100.7, con 2 días.
- Su actividad es "Inició sesión" (0 días), "Cerró el ticket #T-1033" (12 días) y "Cambió su contraseña" (60 días).
- Valentina Soto lleva `createdDaysAgo: 3`. Diego Muñoz lleva `lastAccessDaysAgo: 40`.
- Los demás llevan `createdDaysAgo: 120`, `lastAccessDaysAgo: 1`, `twoFactorActive: true`, una sesión "Chrome · Windows", 192.0.2.10, con 1 día, y `activity: []`.
- Todos llevan `active: true` y `passwordTemporary: false` salvo lo indicado.

### Tonos

| Valor | Tono |
|---|---|
| Cuenta Activo, 2FA Activa, fuerza Fuerte | `green` |
| Cuenta Desactivado | `gray` |
| Contraseña temporal, 2FA Pendiente, fuerza Regular, aviso de administrador | `amber` |
| Fuerza Débil | `red` |
| Fuerza Buena | `blue` |

### Diferencias con Prisma

Se resolverán en el spec que conecte la base.

| Frontend | Modelos `users` y `rol` |
|---|---|
| `active`, `passwordTemporary`, `passwordChangedDaysAgo`, `twoFactorActive` | No existen |
| `sessions`, `activity`, `lastAccessDaysAgo` | No existen |
| `createdDaysAgo` como desfase | `created_at` es una fecha opcional |
| Sin contraseña guardada | `password` obligatorio |
| `roleId` obligatorio | `id_rol` opcional |
| `Role.permissionCount` | No existe; los permisos van en el spec de roles |
| `Role.name` sin límite | `rol` es `VarChar(20)` |

## Comportamiento

### Armazón y enlaces

- "Usuarios" lleva a `/users` y tiene `aria-current="page"` en las tres pantallas.
- La miga de pan empieza por "Configuración", sin enlace.
- Los enlaces a un usuario llevan a `/users/<uuid>`.

### Fechas

- "Hoy" se calcula en el navegador con `useToday`.
- El listado muestra "Cargando usuarios…" y la edición "Cargando usuario…" hasta conocer la fecha. El alta no usa fechas y no espera.
- Las fechas se muestran con `es-CL`, como `27 nov 2026`, con las utilidades de `features/tickets/utils`. Con 0 días se muestra "hoy".

### Listado

- El orden es el de `data/users.ts`. No hay orden por columnas ni paginación.
- El resumen es "6 usuarios · 1 con contraseña temporal · 1 desactivado". Cada parte se omite si su cantidad es 0, con singular cuando es 1. Sin usuarios, "Todavía no hay usuarios.".
- Los filtros de rol son Todos y los roles de `data/roles.ts`, con su cantidad, como botones con `aria-pressed`.
- La búsqueda cubre nombre completo, usuario y email, sin distinguir mayúsculas ni tildes.
- Martín Vidal lleva "Tú" bajo el nombre y el avatar oscuro.
- Los desactivados llevan la etiqueta "Desactivado" junto al nombre y "Restablecer" `disabled`.
- La contraseña muestra "••••••••" y "Cambiada <antigüedad>", o "Temporal, aún sin cambiar" en `amber`.
- "Restablecer" muestra "Enviamos un enlace para restablecer la contraseña a <email>.", con botón para cerrar.
- El lápiz lleva a la edición, con `aria-label` "Editar a <nombre>".
- Los vacíos son los de la plantilla: "Aún no hay usuarios" y "Sin resultados".
- El pie dice "Mostrando N de M usuarios".

### Alta

- Los errores aparecen al primer intento de guardar, con los mensajes de la plantilla.
- Un usuario repetido muestra "Ese nombre de usuario ya existe.". Un email repetido, "Ese email ya está en uso.".
- El usuario se escribe en minúsculas y lleva el prefijo "@" visual.
- "Generar segura" rellena la contraseña y la muestra. El botón del ojo la muestra u oculta, con `aria-label` "Mostrar contraseña" u "Ocultar contraseña".
- La barra de fuerza tiene 4 segmentos y el texto del nivel.
- "Pedir que la cambie en su primer inicio de sesión" empieza marcado.
- Los roles son tarjetas con radio, nombre con tono, descripción y "N de 30 permisos". Ninguno empieza elegido.
- Elegir Administrador muestra el aviso de la plantilla.
- La vista previa muestra iniciales, nombre, usuario, email, contraseña ("Temporal · cambio obligatorio", "Definida" o "—") y rol ("Sin elegir" si falta), y la lista "Qué pasa al crear".
- "Crear usuario" muestra "Usuario @<usuario> creado con el rol <rol>." con el enlace "Ver listado" a `/users`. Conserva los valores y no añade el usuario al listado.
- Cambiar cualquier campo oculta el aviso de creación.

### Edición

- La cabecera muestra las iniciales, "Editar usuario", la etiqueta Activo o Desactivado, y "<nombre> · @<usuario> · creado el <fecha> · último acceso <hoy|fecha|nunca>".
- Los cambios cuentan por nombre, apellido, usuario, email, rol y contraseña temporal escrita. El rol se muestra como "rol (Técnico → Administrador)".
- "Guardar cambios" está `disabled` si no hay cambios. "Descartar" vuelve a los valores guardados.
- Los campos cambiados muestran "· modificado". Al cambiar usuario o email se muestran los textos de ayuda de la plantilla.
- Los errores aparecen al primer intento de guardar, con los mensajes de la plantilla y los de repetidos del alta.
- La sección Rol dice "Cambiará de <rol> a <rol> al guardar." si cambia, y marca "actual" en el rol guardado.
- La sección Contraseña dice "Cambiada <antigüedad>. Por seguridad no se puede ver." o "Temporal, aún sin cambiar.".
- "Definir contraseña temporal" abre el campo con generación, fuerza y el texto de la plantilla. Vacía no cuenta como cambio. Con menos de 12 caracteres, impide guardar.
- Al guardar, el aviso es "Cambios guardados (N).". Con contraseña temporal, la contraseña pasa a temporal, "hoy", y se cierran las sesiones.
- "Enviar enlace de restablecimiento" muestra el aviso del listado con el email guardado.

### Acciones inmediatas

No cuentan como cambio y no necesitan guardar:

- "Desactivar" cierra las sesiones y muestra "Cuenta desactivada y sesiones cerradas.". "Reactivar" muestra "Cuenta reactivada.". Los textos de la zona de peligro cambian según el estado.
- Con la cuenta desactivada, "Enviar enlace de restablecimiento" queda `disabled`.
- "Restablecer 2FA" la deja Pendiente y muestra el aviso de la plantilla. Con 2FA pendiente está `disabled`.
- "Cerrar todas las sesiones" las vacía y muestra "Se cerraron todas las sesiones de @<usuario>.". Sin sesiones, muestra "No hay sesiones abiertas." y queda `disabled`.
- La actividad reciente muestra "<texto> · <hoy|fecha>". Sin actividad, "Sin actividad registrada.".

### Cuenta propia

- En la edición de Martín Vidal, los radios de rol, "Desactivar" y "Eliminar…" quedan `disabled`.
- Se muestra la nota "Es tu cuenta: no puedes cambiar tu rol, desactivarla ni eliminarla.".
- Los demás campos y acciones funcionan igual.

### Eliminación

- "Eliminar…" abre la confirmación de la plantilla. "Eliminar definitivamente" queda `disabled` hasta escribir el usuario guardado exacto.
- Tras eliminar, el aviso "Usuario @<usuario> eliminado." enlaza a `/users`. Los campos y todos los botones de la pantalla, salvo "Volver", quedan `disabled`.

### Estado al navegar

- Alta y edición se reinician al entrar por un enlace, con `useRouter().bfcacheId` como `key`. Con atrás y adelante se conservan.
- El listado conserva búsqueda y filtro de rol. Su aviso se cierra al salir.
- El listado no ve los cambios de la edición.

### Accesibilidad

- Los roles son radios nativos con `.crm-option`, dentro de un `fieldset` con `legend` oculta.
- Los filtros de rol llevan `aria-pressed`. "Restablecer" lleva `aria-label` "Restablecer contraseña de <nombre>".
- La barra de fuerza es `aria-hidden`; el texto del nivel es visible.
- Los campos con error llevan `aria-invalid="true"` y `aria-describedby`.
- Los `id` de formularios salen de `useId`.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.

1. **Ampliar lo compartido.** Iconos de ojo, ojo tachado, restablecer, generar y llave en `components/icons.tsx`.
2. **Crear el modelo.** `features/users/types/role.ts`, `features/users/types/user.ts` y `features/users/constants.ts`.
3. **Crear los datos.** `data/roles.ts` y `data/users.ts`, con los 3 roles y los 6 usuarios.
4. **Crear las utilidades.** `features/users/utils.ts`: nombre completo, rol de un usuario, resumen, búsqueda, antigüedad de contraseña, validación, repetidos, usuario sugerido, fuerza y generación de contraseña.
5. **Crear la ruta y el menú.** `app/users/layout.tsx`, `app/users/page.tsx` con el título, y el `href` de "Usuarios" en `components/app-shell.tsx`.
6. **Crear las etiquetas.** `role-badge.tsx` y `user-status-badge.tsx`.
7. **Crear la tabla.** `users-table.tsx`, con avatar, "Tú", desactivado, contraseña, rol y acciones.
8. **Crear el listado.** `users-list.tsx`, con resumen, búsqueda, filtros, "Restablecer", vacíos y pie. Conectarlo a la página.
9. **Crear la contraseña.** `password-field.tsx` y `password-strength.tsx`, con mostrar, generar y fuerza.
10. **Crear el rol.** `role-picker.tsx`, con tarjetas, "actual", aviso de administrador y estado `disabled`.
11. **Crear el alta.** `app/users/new/page.tsx`, `user-create-form.tsx` y `user-preview.tsx`, con validación, repetidos, sugerencia, aviso y reinicio al navegar.
12. **Crear la ruta de edición.** `app/users/[id]/page.tsx` con `generateStaticParams`, `generateMetadata` y `notFound()`, y `app/users/[id]/not-found.tsx` en español, con `<title>` propio y enlace a `/users`.
13. **Crear la edición.** `user-edit-form.tsx`, con cabecera, datos, contraseña temporal, rol, cambios sin guardar y cuenta propia.
14. **Crear el panel de seguridad.** `user-security.tsx`, con 2FA, sesiones y actividad.
15. **Crear la zona de peligro.** `user-danger-zone.tsx`, con desactivación, confirmación escrita y bloqueo posterior.
16. **Actualizar `CLAUDE.md`.** Añadir `/users`, `features/users`, `data/roles.ts`, `data/users.ts` y la regla de dependencias. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 6 a 15 sin carpeta indicada van en `features/users/components/`.
`features/users` puede importar de las utilidades de fechas de `features/tickets/utils`, de `components/`, de `lib/` y de `data/`. No importa de otros dominios. Ningún otro dominio importa de `features/users`; `data/roles.ts` y `data/users.ts` solo importan sus tipos.
Los pasos 3, 8, 11 y 13 superan 50 líneas por los datos o el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features lib` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` no cambia.
- [ ] Ningún archivo `.tsx` nuevo contiene colores hexadecimales ni estilos `dark:`.
- [ ] Ningún archivo de `features/users` importa de otro dominio, salvo `features/tickets/utils`. Ningún archivo fuera de `features/users` y `app/users` importa de `features/users`, salvo los tipos que importan `data/roles.ts` y `data/users.ts`.
- [ ] Los títulos son "Usuarios — CRM TI", "Nuevo usuario — CRM TI", "Editar usuario — CRM TI" y, en un ID inexistente, "Usuario no encontrado — CRM TI".
- [ ] El menú muestra 8 elementos y solo "Clientes", "Servicios", "Tickets", "Proyectos" y "Usuarios" tienen `href`.
- [ ] `/users` muestra "6 usuarios · 1 con contraseña temporal · 1 desactivado", 6 filas y "Mostrando 6 de 6 usuarios".
- [ ] Los filtros muestran Todos 6, Administrador 1, Técnico 3 y Solo lectura 2. "Técnico" deja 3 filas y tiene `aria-pressed="true"`.
- [ ] Martín Vidal muestra "Tú". Diego Muñoz muestra "Desactivado" y su "Restablecer" está `disabled`.
- [ ] Valentina Soto muestra "Temporal, aún sin cambiar" en `amber`. Camila Rojas muestra "Cambiada hace 2 meses" y Matías Fuentes "Cambiada hace 3 semanas".
- [ ] Buscar "rojas" deja 1 fila, buscar "munoz" deja 1, buscar "example.com" deja 6 y buscar "zzz" muestra "Sin resultados".
- [ ] "Restablecer" de Camila Rojas muestra "Enviamos un enlace para restablecer la contraseña a camila.rojas@example.com.".
- [ ] Con `users` vacío temporalmente se muestra "Todavía no hay usuarios." y "Aún no hay usuarios".
- [ ] Guardar el alta vacía muestra 6 errores y "Revisa los campos marcados antes de crear el usuario.".
- [ ] Escribir "Camila" y "Rojas" sugiere "crojas"; al guardar muestra "Ese nombre de usuario ya existe.".
- [ ] Escribir "Pedro" y "Núñez Soto" sugiere "pnunez". Editar el usuario detiene la sugerencia.
- [ ] El email "CAMILA.ROJAS@example.com" muestra "Ese email ya está en uso." al guardar.
- [ ] "hola1234" muestra "Débil" y, al guardar, "Tiene 8 caracteres; necesita al menos 12.". "Generar segura" deja 16 caracteres visibles y "Fuerte".
- [ ] Elegir Administrador muestra el aviso de acceso total y la vista previa dice "Administrador".
- [ ] Crear un usuario completo muestra "Usuario @<usuario> creado con el rol <rol>." y "Ver listado"; `/users` sigue mostrando 6 filas.
- [ ] Los 6 usuarios abren su edición; `/users/not-found` muestra la página de usuario no encontrado.
- [ ] Camila Rojas muestra "Activo", "@crojas", "último acceso hoy", 2 sesiones, "Activa" en 2FA y 3 actividades. "Técnico" lleva "actual".
- [ ] Cambiar su rol a Administrador muestra "1 cambio sin guardar: rol (Técnico → Administrador)" y "Cambiará de Técnico a Administrador al guardar.". "Descartar" lo revierte.
- [ ] Cambiar su usuario a "mfuentes" y guardar muestra "Ese nombre de usuario ya existe.". Cambiarlo a "camila.r" muestra "· modificado" y "Deberá entrar con el nuevo nombre de usuario.".
- [ ] Guardar dos cambios muestra "Cambios guardados (2)." y "Guardar cambios" vuelve a `disabled`.
- [ ] Una contraseña temporal de 8 caracteres impide guardar con "Necesita al menos 12 caracteres.". Una de 16 se guarda, deja "Temporal, aún sin cambiar." y 0 sesiones.
- [ ] "Cerrar todas las sesiones" deja "No hay sesiones abiertas." y el botón `disabled`. "Restablecer 2FA" deja "Pendiente".
- [ ] "Desactivar" muestra "Cuenta desactivada y sesiones cerradas.", la etiqueta "Desactivado" y "Reactivar cuenta", y "Guardar cambios" sigue `disabled`.
- [ ] Diego Muñoz muestra "Desactivado", "Reactivar" y "Enviar enlace de restablecimiento" `disabled`.
- [ ] Valentina Soto muestra "último acceso nunca", "Pendiente" en 2FA y "Sin actividad registrada.".
- [ ] Martín Vidal muestra la nota de cuenta propia, con los radios de rol, "Desactivar" y "Eliminar…" `disabled`.
- [ ] "Eliminar definitivamente" sigue `disabled` con "croja" y se habilita con "crojas". Después todo queda deshabilitado salvo "Volver" y el aviso enlaza a `/users`.
- [ ] Un borrador de alta o edición desaparece al volver por un enlace y se conserva al volver con atrás.
- [ ] El listado conserva búsqueda y filtro al volver; el aviso no.
- [ ] Las flechas del teclado cambian el rol.
- [ ] Los campos con error tienen `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [ ] Con Playwright, las pantallas de `/users`, `/services`, `/projects`, `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px.

## Decisiones

- **Sí:** solo usuarios, con los roles como datos fijos. Roles y permisos va en su propio spec; lo eligió el usuario.
- **No:** usuarios y roles juntos. Serían seis pantallas, dos dominios y la matriz de permisos.
- **Sí:** ruta `/users`, plana como las demás, con "Configuración" sin enlace en la miga. Lo eligió el usuario.
- **No:** `/settings/users`. Rompe el patrón de rutas actual sin aportar nada mientras no exista `/settings`.
- **Sí:** `data/roles.ts` con UUID y `roleId` en el usuario. Coincide con `users.id_rol` y el spec de roles lo reutiliza; lo eligió el usuario.
- **No:** unión de tipos fija para los roles. Habría que migrarla al hacer los roles editables.
- **Sí:** panel de seguridad con datos de ejemplo y acciones inmediatas. Lo eligió el usuario; mismo patrón que "Marcar pagado".
- **Sí:** desactivar al instante, con etiqueta en el listado y un usuario de ejemplo desactivado. La plantilla no mostraba el estado fuera de la edición; lo eligió el usuario.
- **No:** desactivar como cambio a guardar. La plantilla lo hace al instante y su aviso lo confirma.
- **Sí:** proteger la cuenta propia. Evita quedarse sin administrador; lo eligió el usuario.
- **No:** menú "Más acciones". En la plantilla no hacía nada y duplicaría la zona de peligro.
- **Sí:** validar usuario y email repetidos. `user_name` es único en la base; lo eligió el usuario.
- **No:** enlace "Crear un rol nuevo". `/roles` no existe; se añade en el spec de roles.
- **Sí:** confirmar la eliminación escribiendo el usuario, como la plantilla. Borrar una cuenta es más delicado que borrar un servicio; lo eligió el usuario.
- **Sí:** bloquear tras eliminar. Es la regla de los SPEC 03 a 06.
- **Sí:** desactivados siempre visibles. Son pocos y conviene verlos; lo eligió el usuario.
- **Sí:** antigüedad, creación, último acceso y actividad como desfases en días, sin hora. Mismo patrón que los specs anteriores; la plantilla fijaba "hoy, 09:42".
- **Sí:** actividad de Camila Rojas con "#T-1033", que existe en `data/tickets.ts`, sin enlace. Un enlace acoplaría usuarios con tickets.
- **Sí:** la contraseña generada incluye las 4 clases de caracteres. La plantilla podía generar una que no llegara a "Fuerte".
- **Sí:** contraseña sin guardar en los datos. Es una maqueta: solo se guardan los indicadores que muestra la interfaz.
- **No:** estado compartido entre pantallas. Sería código desechable, como en los specs anteriores.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El listado y la edición usan la fecha y rompen el prerender con `cacheComponents`. | Calcular con `useToday` en el navegador y mostrar "Cargando…" antes; compilar al cerrar el paso 8. |
| `crypto.getRandomValues` en el render rompe la hidratación. | Generar solo en el manejador del botón, nunca al renderizar. |
| La contraseña generada o escrita aparece en registros o en la URL. | Solo vive en el estado del formulario; no se pasa a la URL ni a la consola. |
| Los avisos de correo y de creación hacen creer que el sistema funciona. | No desplegarla como producto hasta conectar la base y la autenticación. |
| `features/users` se acopla a otros dominios. | Importar solo utilidades de fechas de `features/tickets/utils` y comprobarlo con el criterio de importaciones. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación, login y persistencia.
- Cambios en el esquema de la base.
- Pantallas de roles y permisos, su enlace en el menú y "Crear un rol nuevo".
- Envío real de correos, cifrado de contraseñas y 2FA real.
- Menú "Más acciones" en las filas.
- Asignar tickets o proyectos a usuarios.
- Cambiar el usuario de la tarjeta del menú lateral.
- Estado compartido entre pantallas.

Cada uno de estos puntos, si se aborda, va en su propio spec.
