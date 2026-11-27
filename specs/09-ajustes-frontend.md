# SPEC 09 — Frontend de ajustes y modo oscuro

> **Estado:** Aprobado
> **Depende de:** SPEC 02, SPEC 04, SPEC 08
> **Fecha:** 2026-11-27
> **Objetivo:** Que `/settings` permita elegir tema claro, oscuro o del sistema y color de acento con efecto real en toda la app, y editar ajustes regionales y de seguridad de ejemplo, sin backend.

## Por qué existe este spec

"Ajustes" es el último elemento del grupo "Configuración" del menú que sigue sin pantalla.
No hay plantilla `.dc.html` para él: el diseño sale de las clases `.crm-*` y los componentes compartidos, y los textos se fijan aquí.

El modo oscuro rompe una regla vigente de `CLAUDE.md` ("Solo hay modo claro").
Se resuelve con tokens: los colores oscuros redefinen los de `@theme static` bajo `[data-theme="dark"]`, y se sigue sin usar utilidades `dark:`.
Así cada pantalla existente cambia de tema sin tocar su marcado, salvo los 9 colores fijos que hoy usan `text-white`.

## Alcance

**Incluye:**

- Paleta oscura completa en `app/globals.css` y el token nuevo `ink-inverse` para el texto sobre fondos sólidos.
- Sustituir `text-white` y `var(--color-white)` por `ink-inverse` en `globals.css` y en los 7 componentes que los usan.
- Script en `<head>` que aplica tema y acento guardados antes de pintar, y sigue al sistema operativo con "Sistema".
- `/settings` con tres secciones: Apariencia, Regional y Seguridad.
- Apariencia con vista previa al elegir, guardada en `localStorage` al pulsar "Guardar cambios".
- Regional (zona horaria, formato de fecha, moneda) y Seguridad (2FA obligatoria, largo mínimo de contraseña, cierre por inactividad) solo como estado del formulario.
- Cambios sin guardar, "Descartar", validación y aviso de guardado.
- Dominio nuevo `features/settings` y valores por defecto en `data/settings.ts`.
- Enlace "Ajustes" en el menú.

**Fuera de alcance:**

- Prisma, server actions, API, autenticación y persistencia en la base.
- Cambios en `prisma/`.
- Aplicar los ajustes regionales: zona horaria y formato de fecha no cambian cómo se muestran las fechas en otras pantallas.
- Aplicar las políticas de seguridad: el largo mínimo no cambia la regla de 12 caracteres de usuarios, la 2FA no se exige y no hay cierre de sesión.
- Datos de la empresa, primer día de la semana y caducidad de contraseña.
- Sincronizar la apariencia entre pestañas abiertas (evento `storage`).
- Botón "Restablecer valores por defecto".
- Ajustes por usuario: la apariencia es del navegador, no de la cuenta.
- Selector de tema fuera de `/settings` (por ejemplo, en el menú lateral).

## Modelo de datos

`features/settings/types/settings.ts`:

```ts
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Accent = "orange" | "blue" | "green" | "purple";
export type TimeZone =
  | "America/Santiago"
  | "America/Punta_Arenas"
  | "Pacific/Easter"
  | "UTC";
export type DateFormat = "short" | "numeric" | "iso"; // 27 nov 2026 · 27-11-2026 · 2026-11-27
export type IdleTimeout = 15 | 30 | 60 | 240; // minutos

export interface Appearance {
  theme: ThemeMode;
  accent: Accent;
}

export interface RegionalSettings {
  timeZone: TimeZone;
  dateFormat: DateFormat;
}

export interface SecuritySettings {
  requireTwoFactor: boolean;
  minPasswordLength: string; // texto del campo; válido si es un entero de 8 a 15
  idleTimeoutMinutes: IdleTimeout;
}

export interface SettingsValues {
  appearance: Appearance;
  regional: RegionalSettings;
  security: SecuritySettings;
}
```

`features/settings/constants.ts` exporta:

- `THEME_OPTIONS`: Claro (`light`), Oscuro (`dark`) y Sistema (`system`), en ese orden.
- `ACCENT_OPTIONS`: Naranja, Azul, Verde y Morado, con la clase de su punto (`bg-tone-orange-dot`, `bg-tone-blue-dot`, `bg-tone-green-dot`, `bg-tone-purple-dot`).
- `TIME_ZONE_OPTIONS`: "Chile continental (America/Santiago)", "Magallanes (America/Punta_Arenas)", "Isla de Pascua (Pacific/Easter)" y "UTC".
- `DATE_FORMAT_OPTIONS`: `short`, `numeric` e `iso`, en ese orden.
- `IDLE_TIMEOUT_OPTIONS`: "15 min", "30 min", "1 h" y "4 h".
- `MIN_PASSWORD_LENGTH = 8` y `MAX_PASSWORD_LENGTH = 15`.
- `APPEARANCE_STORAGE_KEY = "crm:appearance:v1"`.
- `DEFAULT_APPEARANCE`: `{ theme: "system", accent: "orange" }`.

`data/settings.ts` exporta `defaultSettings` con `regional` y `security`; solo importa sus tipos:

| Campo | Valor |
|---|---|
| `timeZone` | `America/Santiago` |
| `dateFormat` | `short` |
| `requireTwoFactor` | `true` |
| `minPasswordLength` | `"8"` |
| `idleTimeoutMinutes` | `30` |

Reglas:

- `localStorage[APPEARANCE_STORAGE_KEY]` guarda `JSON.stringify(appearance)`. Si falta, el JSON no es válido o un valor no está en las uniones, se usa `DEFAULT_APPEARANCE` para ese campo. Leer o escribir va siempre en `try/catch`.
- El tema resuelto es `theme`, o el de `matchMedia("(prefers-color-scheme: dark)")` con `system`.
- `<html>` lleva `data-theme-mode` (`light`, `dark` o `system`), `data-theme` (`light` o `dark`, el resuelto) y `data-accent`. El CSS solo lee `data-theme` y `data-accent`.
- El largo mínimo es válido si es un entero entre 8 y 15, sin espacios ni decimales.
- Los ejemplos de formato usan "hoy": `short` con `formatDate` de `features/tickets/utils`, `numeric` como `DD-MM-AAAA` e `iso` como `AAAA-MM-DD`.

`features/settings/appearance.ts` exporta `readAppearance()`, `writeAppearance(appearance)`, `applyAppearance(appearance)` y `APPEARANCE_SCRIPT`, el código del script de `<head>`, armado con las mismas constantes.

### Paleta oscura

`app/globals.css` añade `--color-ink-inverse: #ffffff` a `@theme static` y redefine en `@layer base`, bajo `[data-theme="dark"]`, con `color-scheme: dark`:

| Token | Oscuro |
|---|---|
| `canvas` | `#0f1114` |
| `surface` | `#171a1e` |
| `surface-muted` | `#1c1f24` |
| `surface-hover` | `#22262c` |
| `nav-hover` | `#262a31` |
| `row-hover` | `#1b1e23` |
| `ink` | `#eceef1` |
| `ink-soft` | `#c3c8cf` |
| `ink-muted` | `#9aa1ab` |
| `ink-inverse` | `#15181c` |
| `ink-inverse-muted` | `#4a515b` |
| `line` | `#2c3036` |
| `line-soft` | `#24282d` |
| `line-strong` | `#3d424a` |
| `line-field` | `#6b727c` |
| `danger` | `#f97066` |
| `danger-line` | `#7a2e27` |
| `warning` | `#f5a524` |
| `success` | `#34d399` |

| Tono | `bg` | `fg` | `line` | `dot` |
|---|---|---|---|---|
| `orange` | `#3a1f12` | `#fdba8c` | `#6b3518` | `#fb923c` |
| `blue` | `#172340` | `#a9c1fb` | `#2b3f6e` | `#7aa2f7` |
| `amber` | `#35260d` | `#f6cf8a` | `#634616` | `#f5a524` |
| `green` | `#0f2e22` | `#8fe0b8` | `#1d5440` | `#34d399` |
| `gray` | `#262a30` | `#c3c8cf` | `#3d424a` | `#8c9199` |
| `red` | `#3a1714` | `#f9b0a7` | `#6e2a24` | `#f97066` |
| `purple` | `#2a1f47` | `#cdb9fd` | — | `#b197fc` |

- El acento oscuro es `#fb923c` (naranja), `#7aa2f7` (azul), `#34d399` (verde) y `#b197fc` (morado), con la regla `[data-theme="dark"][data-accent="…"]`.
- Las sombras oscuras usan `rgba(0, 0, 0, …)`: foco `0 0 0 3px rgba(236, 238, 241, 0.18)`, tarjeta con opacidades 0.3 y 0.5, y popover con 0.6.
- `ink-inverse` es el texto sobre fondos sólidos: `bg-ink`, `.crm-tile-dark`, `.crm-btn-primary`, `.crm-btn-danger-solid` y `.crm-pill` marcada. En oscuro esos fondos son claros y su texto es oscuro.
- Los colores siguen solo en `globals.css`. Ningún `.tsx` lleva hexadecimales ni `dark:`.

### Diferencias con Prisma

No hay modelo de ajustes en el esquema. Se definirá en el spec que conecte la base.

## Comportamiento

### Armazón y enlaces

- "Ajustes" lleva a `/settings` y tiene `aria-current="page"` en esa pantalla.
- La miga de pan es "Configuración / Ajustes", con "Configuración" sin enlace.
- El título es "Ajustes" y el subtítulo "Preferencias del CRM. La apariencia se guarda en este navegador.".

### Tema en toda la app

- `app/layout.tsx` inserta `APPEARANCE_SCRIPT` en `<head>` y lleva `suppressHydrationWarning` en `<html>`.
- El script lee la clave, fija los tres atributos de `<html>` y, mientras `data-theme-mode` sea `system`, actualiza `data-theme` al cambiar el tema del sistema operativo.
- Sin clave guardada, la app sigue al sistema operativo con acento naranja.
- Todas las pantallas existentes cambian de tema sin recargar.

### Carga

- "Hoy" se calcula en el navegador con `useToday`, y la apariencia guardada se lee en el navegador.
- La pantalla muestra "Cargando ajustes…" hasta conocer ambos.

### Apariencia

- "Tema" es un `PillRadioGroup` con Claro, Oscuro y Sistema. Con Sistema se muestra "Ahora: claro, según tu sistema." u "Ahora: oscuro, según tu sistema.", y se actualiza en vivo.
- "Color de acento" es un `PillRadioGroup` con Naranja, Azul, Verde y Morado, con su punto de color.
- Elegir una opción aplica la vista previa al instante en `<html>`, sin escribir en `localStorage`.
- "Guardar cambios" escribe la apariencia en `localStorage`.
- "Descartar" vuelve a la apariencia guardada y la aplica.
- Salir de la pantalla sin guardar vuelve a aplicar la apariencia guardada. Al volver con atrás, el borrador se conserva y su vista previa se aplica de nuevo.

### Regional

- "Zona horaria" es un `select` con `.crm-field` y las 4 opciones.
- "Formato de fecha" es un `PillRadioGroup` cuyas etiquetas son el ejemplo con la fecha de hoy, como "27 nov 2026", "27-11-2026" y "2026-11-27".
- "Moneda" es de solo lectura: "CLP · peso chileno" y "Los montos se registran en pesos enteros, sin decimales.".
- Nota de la sección: "Por ahora las demás pantallas siguen mostrando las fechas como 27 nov 2026.", con la fecha de hoy.

### Seguridad

- "Exigir 2FA a todos los usuarios" es un `checkbox` nativo con `.crm-checkbox`, marcado por defecto.
- Al desmarcarlo se muestra en `amber`: "Sin 2FA obligatoria, una contraseña filtrada basta para entrar al CRM.".
- "Largo mínimo de contraseña" es un campo numérico (`inputMode="numeric"`) con la ayuda "Entre 8 y 15 caracteres.".
- "Cierre por inactividad" es un `PillRadioGroup` con 15 min, 30 min, 1 h y 4 h.
- Nota de la sección: "Estas políticas se aplicarán cuando exista el inicio de sesión.".

### Cambios y guardado

- Los cambios cuentan por tema, acento, zona horaria, formato de fecha, 2FA obligatoria, largo mínimo y cierre por inactividad.
- El aviso dice "Cambios sin guardar: tema · acento · …", con los nombres en ese orden, y lleva "Descartar".
- Los campos cambiados muestran "· modificado" (tema, acento, formato de fecha, largo mínimo, cierre por inactividad) o "· modificada" (zona horaria, 2FA obligatoria).
- "Guardar cambios" está `disabled` si no hay cambios.
- Los errores aparecen al primer intento de guardar:
  - Largo vacío: "Indica el largo mínimo.".
  - Fuera de rango o no entero: "Usa un número entre 8 y 15.".
- Con errores no se guarda nada y se muestra "Revisa los campos marcados antes de guardar.".
- Al guardar se muestra "Ajustes guardados.". Los valores pasan a ser la referencia y "Guardar cambios" vuelve a `disabled`.
- Cambiar cualquier campo oculta el aviso de guardado.

### Estado al navegar

- La pantalla se reinicia al entrar por un enlace, con `useRouter().bfcacheId` como `key`: Regional y Seguridad vuelven a `defaultSettings` y Apariencia a lo guardado en `localStorage`.
- Con atrás y adelante se conserva el borrador.
- Regional y Seguridad guardados se pierden al recargar o al entrar por un enlace.

### Accesibilidad

- Cada sección es una `.crm-card` con un `h2`.
- Los grupos de opciones son radios nativos dentro de `fieldset` con `legend`; las flechas cambian la opción.
- El campo con error lleva `aria-invalid="true"` y `aria-describedby`.
- Los `id` del formulario salen de `useId`.
- El texto y los tonos de la paleta oscura cumplen contraste 4.5:1 sobre `canvas`, `surface` y su fondo de tono.

## Plan de implementación

Antes de escribir código de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`, en particular la de scripts en el layout raíz.

1. **Añadir `ink-inverse`.** El token en `@theme static` y el cambio de `var(--color-white)` en `globals.css` y de `text-white` en los 7 componentes. En claro nada cambia de aspecto.
2. **Añadir la paleta oscura.** Las reglas `[data-theme="dark"]` y `[data-theme="dark"][data-accent="…"]` en `globals.css`. Comprobar a mano poniendo `data-theme="dark"` en `<html>` desde las herramientas del navegador.
3. **Crear el modelo.** `features/settings/types/settings.ts`, `features/settings/constants.ts` y `data/settings.ts`.
4. **Crear la apariencia.** `features/settings/appearance.ts`, con lectura, escritura, aplicación y `APPEARANCE_SCRIPT`.
5. **Conectar el script.** `app/layout.tsx` con el script en `<head>` y `suppressHydrationWarning`. Comprobar que una clave escrita a mano en `localStorage` cambia la app al recargar, sin errores de hidratación.
6. **Crear las utilidades.** `features/settings/utils.ts`: ejemplos de formato, validación del largo mínimo, cambios y nombres de cambios.
7. **Crear la ruta y el menú.** `app/settings/layout.tsx`, `app/settings/page.tsx` con el título, y el `href` de "Ajustes" en `components/app-shell.tsx`.
8. **Crear Apariencia.** `appearance-section.tsx`, con vista previa y "Ahora: …" en vivo.
9. **Crear Regional.** `regional-section.tsx`, con zona horaria, formato con ejemplos, moneda y nota.
10. **Crear Seguridad.** `security-section.tsx`, con 2FA y su aviso, largo mínimo y cierre por inactividad.
11. **Crear el formulario.** `settings-form.tsx`, con carga, cambios sin guardar, "Descartar", validación, guardado, reversión al salir y reinicio al navegar. Conectarlo a la página.
12. **Actualizar `CLAUDE.md`.** Cambiar la regla de modo claro por la de `data-theme`, y añadir `/settings`, `features/settings`, `data/settings.ts`, `ink-inverse` y la regla de dependencias. Es un archivo local, sin rastrear en git.

Los componentes de los pasos 8 a 11 van en `features/settings/components/`.
`features/settings` puede importar de `formatDate` en `features/tickets/utils`, de `components/`, de `lib/` y de `data/`. Ningún otro dominio importa de `features/settings`; solo `app/layout.tsx` y `app/settings` lo hacen.
Los pasos 2 y 11 superan 50 líneas por la paleta y el marcado; se aceptan porque dividirlos dejaría piezas a medias.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app components data features lib` termina sin errores.
- [ ] Ningún archivo de `app`, `components`, `data` o `features` importa `lib/db` o `@prisma/client`, ni contiene `"use server"`.
- [ ] `prisma/` no cambia.
- [ ] Ningún archivo `.tsx` contiene colores hexadecimales, `text-white`, `bg-white` ni estilos `dark:`. `globals.css` no contiene `--color-white`.
- [ ] Ningún archivo fuera de `features/settings`, `app/settings` y `app/layout.tsx` importa de `features/settings`, salvo el tipo que importa `data/settings.ts`. `features/settings` solo importa de otro dominio `features/tickets/utils`.
- [ ] El título es "Ajustes — CRM TI".
- [ ] El menú muestra 8 elementos y todos tienen `href` salvo "Dashboard".
- [ ] Sin clave guardada y con el sistema en claro, `<html>` tiene `data-theme-mode="system"`, `data-theme="light"` y `data-accent="orange"`, y "Sistema" muestra "Ahora: claro, según tu sistema.".
- [ ] Emular `prefers-color-scheme: dark` con "Sistema" pasa `data-theme` a `dark` sin recargar, en `/settings` y en `/clients`.
- [ ] Elegir "Oscuro" y "Azul" cambia la app al instante y muestra "Cambios sin guardar: tema · acento"; `localStorage` no cambia.
- [ ] "Descartar" vuelve a `data-theme="light"` y `data-accent="orange"`.
- [ ] Guardar "Oscuro" y "Verde" muestra "Ajustes guardados." y deja `{"theme":"dark","accent":"green"}` en `crm:appearance:v1`.
- [ ] Al recargar con esa clave, `<html>` tiene `data-theme="dark"` y `data-accent="green"` en el primer pintado, sin errores de hidratación en consola.
- [ ] Elegir "Morado" sin guardar e ir a `/tickets` por el menú deja `data-accent="green"`.
- [ ] Con `crm:appearance:v1` igual a `"{roto"` o `{"theme":"x","accent":"rosa"}`, la app usa Sistema y naranja sin errores.
- [ ] En oscuro, `/clients`, `/tickets`, `/projects`, `/services`, `/users`, `/roles` y `/settings` muestran fondo `canvas` oscuro y ningún texto, avatar o botón primario queda ilegible.
- [ ] En oscuro, el avatar de Martín Vidal y el logo del menú muestran fondo claro con texto oscuro.
- [ ] "Formato de fecha" muestra el ejemplo de hoy en los tres formatos.
- [ ] "Moneda" muestra "CLP · peso chileno" y no es editable.
- [ ] Cambiar la zona horaria a "UTC" muestra "· modificada" y "Cambios sin guardar: zona horaria".
- [ ] Desmarcar "Exigir 2FA a todos los usuarios" muestra el aviso `amber`.
- [ ] Guardar con largo mínimo "7", "16" o "8.5" muestra "Usa un número entre 8 y 15." y "Revisa los campos marcados antes de guardar."; vacío muestra "Indica el largo mínimo.".
- [ ] Guardar con largo "15" y "1 h" muestra "Ajustes guardados." y "Guardar cambios" queda `disabled`.
- [ ] Al volver a `/settings` por un enlace, el largo mínimo es "8" y el cierre "30 min"; con atrás se conserva el borrador.
- [ ] Las flechas del teclado cambian tema, acento, formato y cierre.
- [ ] El campo con error tiene `aria-invalid="true"` y `aria-describedby` apunta a su mensaje.
- [ ] La regla de 12 caracteres de `/users/new` no cambia.
- [ ] Con Playwright, `/settings`, `/roles`, `/users`, `/services`, `/projects`, `/tickets` y `/clients` no tienen errores en consola ni desbordan en horizontal a 1440 px y 390 px, en claro y en oscuro.

## Decisiones

- **Sí:** modo oscuro en este spec. La apariencia sin efecto real no tendría sentido; lo eligió el usuario.
- **No:** un spec aparte para el tema. No tendría interfaz para probarlo.
- **Sí:** oscuro por tokens bajo `[data-theme="dark"]`, sin `dark:`. Las pantallas cambian sin tocar su marcado y los colores siguen solo en `globals.css`.
- **Sí:** token `ink-inverse` para el texto sobre fondos sólidos. En oscuro `ink` y el acento son claros, y `text-white` quedaría ilegible.
- **Sí:** acentos más claros en oscuro, con texto `ink-inverse`. Los acentos claros no alcanzan contraste como texto sobre `surface` oscuro.
- **Sí:** paleta definida en este spec. Lo eligió el usuario.
- **Sí:** Claro, Oscuro y Sistema, con Sistema por defecto. Lo eligió el usuario.
- **Sí:** vista previa al elegir y guardado con "Guardar cambios". Un solo botón para toda la pantalla; lo eligió el usuario.
- **Sí:** volver a lo guardado al salir sin guardar. Si no, una vista previa quedaría aplicada sin estar guardada.
- **Sí:** `localStorage` con la clave versionada `crm:appearance:v1` en JSON. Permite cambiar el formato sin romper lo guardado; lo eligió el usuario.
- **Sí:** script en `<head>` con `data-theme` resuelto. Evita el parpadeo al cargar y deja el CSS sin duplicar la paleta en un `@media`.
- **No:** `@media (prefers-color-scheme: dark)` en el CSS. Obligaría a repetir toda la paleta.
- **Sí:** una página con tres secciones apiladas. Mismo patrón que las ediciones; lo eligió el usuario.
- **No:** pestañas o subrutas. Más estructura para pocos campos.
- **Sí:** diseño con clases `.crm-*` y componentes compartidos, sin plantilla. Lo eligió el usuario.
- **Sí:** Regional y Seguridad solo como estado del formulario. Aplicarlos tocaría las fechas de toda la app y las reglas de usuarios; lo eligió el usuario.
- **Sí:** notas que dicen que Regional y Seguridad aún no se aplican. Evitan creer que el ajuste funciona.
- **Sí:** largo mínimo de 8 a 15, con 8 por defecto. Lo eligió el usuario.
- **No:** cambiar la regla de 12 caracteres de usuarios. Seguridad no se aplica en este spec.
- **No:** datos de la empresa, primer día de la semana y caducidad de contraseña. No los eligió el usuario.
- **No:** sincronizar pestañas y restablecer valores por defecto. No los pidió el usuario y añaden estados.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El script cambia atributos de `<html>` y provoca errores de hidratación. | `suppressHydrationWarning` en `<html>`; comprobarlo en consola al cerrar el paso 5. |
| El script o `useToday` rompen el prerender con `cacheComponents`. | El script es un texto estático y la fecha se calcula en el navegador; compilar al cerrar los pasos 5 y 11. |
| Algún color fijo no detectado queda ilegible en oscuro. | Criterio de búsqueda de `text-white`, `bg-white` y hexadecimales, y revisión con Playwright de las 7 pantallas en oscuro. |
| Los controles nativos (`select`, `checkbox`, fechas) siguen claros en oscuro. | `color-scheme: dark` bajo `[data-theme="dark"]`. |
| Una vista previa queda aplicada sin guardar al navegar. | Revertir en la limpieza del efecto, que también corre cuando Activity oculta la pantalla. |
| El largo mínimo de 8 contradice la regla de 12 de usuarios. | No se aplica en este spec; se resuelve en el que conecte las políticas de seguridad. |
| `localStorage` bloqueado o con datos corruptos. | Lectura y escritura en `try/catch`, con `DEFAULT_APPEARANCE` como respaldo. |

## Qué **no** está en este spec

- Prisma, server actions, autenticación y persistencia en la base.
- Cambios en el esquema de la base.
- Aplicar zona horaria y formato de fecha en otras pantallas.
- Aplicar las políticas de seguridad.
- Datos de la empresa, primer día de la semana y caducidad de contraseña.
- Sincronizar la apariencia entre pestañas.
- Restablecer valores por defecto.
- Ajustes por usuario.
- Selector de tema fuera de `/settings`.

Cada uno de estos puntos, si se aborda, va en su propio spec.
