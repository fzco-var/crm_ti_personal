# SPEC 02 — Estilos globales del CRM

> **Estado:** Aprobado
> **Depende de:** ninguno
> **Fecha:** 2026-11-25
> **Objetivo:** Que `app/globals.css` ofrezca los tokens, estilos base y clases compartidas del diseño del CRM.

## Por qué existe este spec

Las plantillas repiten sus estilos en línea en cada pantalla.
Además, `app/globals.css` sigue siendo el de create-next-app y cambia a modo oscuro, que el diseño no define.

La referencia son las 22 plantillas vigentes de `references/CRM-TI-templates/templates/` y su `LEEME.md`.
Quedan excluidas `Main`, `Verificacion`, `LoginB` y `LoginD`, que son diseños descartados.

## Alcance

**Incluye:**

- Tokens de color, tipografía, radio y sombra en `app/globals.css`.
- Estilos base: fondo, texto, enlaces y foco visible.
- Cuatro acentos mediante `data-accent`.
- Clases `.crm-*` para los patrones compartidos y el armazón (menú lateral y contenido).
- Manrope y JetBrains Mono con `next/font/google` en `app/layout.tsx`, y `lang="es"`.

**Fuera de alcance:**

- Modo oscuro.
- Componentes React y pantallas.
- Patrones de una sola pantalla, como las barras del dashboard, los dígitos del 2FA o el selector de estado dentro de la tabla de tickets.
- Selector de acento en la interfaz y su persistencia.
- Página de muestra `/estilos`.
- Cambios en `app/page.tsx` y en los metadatos de `app/layout.tsx`.

## Modelo de datos

No hay datos nuevos. Los contratos que introduce este spec son los nombres siguientes.

### Colores

| Token | Valor | Uso |
|---|---|---|
| `--color-canvas` | `#F3F3EF` | Fondo de la app |
| `--color-surface` | `#FFFFFF` | Tarjetas y campos |
| `--color-surface-muted` | `#F7F7F3` | Cabeceras de tabla y hover de filas y opciones |
| `--color-surface-hover` | `#F1F1EC` | Hover de botones secundarios, chips e iconos |
| `--color-nav-hover` | `#E9E9E3` | Hover del menú lateral |
| `--color-row-hover` | `#FAFAF7` | Hover de filas de tabla |
| `--color-ink` | `#15181C` | Texto principal y foco |
| `--color-ink-soft` | `#3F4650` | Texto secundario |
| `--color-ink-muted` | `#5C636D` | Texto atenuado |
| `--color-line` | `#E2E2DC` | Borde de tarjetas |
| `--color-line-soft` | `#ECECE6` | Divisores |
| `--color-line-strong` | `#C9C9C1` | Borde de botones secundarios y chips |
| `--color-line-field` | `#8C9199` | Borde de campos |
| `--color-danger` | `#B42318` | Error |
| `--color-danger-line` | `#D9A097` | Borde del botón de peligro |
| `--color-warning` | `#B45309` | Advertencia |
| `--color-success` | `#047857` | Éxito |
| `--color-accent` | `#C2410C` | Acento por defecto |

`--color-background` y `--color-foreground` se conservan como alias de `canvas` e `ink`, porque `app/page.tsx` usa `bg-foreground` y `text-background`.

### Tonos

Cada tono define `--color-tone-<tono>-bg`, `-fg`, `-line` y `-dot`.

| Tono | `bg` | `fg` | `line` | `dot` |
|---|---|---|---|---|
| `orange` | `#FDEDE5` | `#9A3412` | `#F2C3AD` | `#C2410C` |
| `blue` | `#E8EEFC` | `#1E40AF` | `#BCCBF2` | `#1D4ED8` |
| `amber` | `#FDF6EC` | `#6B3A06` | `#F1D3A8` | `#B45309` |
| `green` | `#EEF8F2` | `#0F5132` | `#B7DCC7` | `#047857` |
| `gray` | `#EDEDE8` | `#3F4650` | `#D5D5CE` | `#8C9199` |
| `red` | `#FDF2F0` | `#8A1F14` | `#F0C2BB` | `#B42318` |
| `purple` | `#EFE9FB` | `#5B21B6` | — | — |

`purple` solo define `bg` y `fg`: las plantillas no le dan borde ni punto.

### Acentos

| Atributo en `<html>` | `--color-accent` |
|---|---|
| sin atributo, o `data-accent="orange"` | `#C2410C` |
| `data-accent="blue"` | `#1D4ED8` |
| `data-accent="green"` | `#047857` |
| `data-accent="purple"` | `#6D28D9` |

### Tipografía, radios y sombras

| Token | Valor |
|---|---|
| `--font-sans` | `var(--font-manrope), system-ui, sans-serif` |
| `--font-mono` | `var(--font-jetbrains-mono), monospace` |
| `--text-2xs` | 11 px (`0.6875rem`) |
| `--text-compact` | 13 px (`0.8125rem`) |
| `--text-field` | 15 px (`0.9375rem`) |
| `--text-brand` | 17 px (`1.0625rem`) |
| `--radius-control` | 10 px |
| `--radius-tile` | 14 px |
| `--radius-card` | 16 px |
| `--shadow-focus` | `0 0 0 3px rgba(21,24,28,0.12)` |
| `--shadow-card` | `0 1px 2px rgba(21,24,28,0.04), 0 12px 32px -12px rgba(21,24,28,0.12)` |
| `--shadow-popover` | `0 8px 24px -12px rgba(21,24,28,0.18)` |

Para los demás tamaños y radios se usan los de Tailwind.

### Clases

| Grupo | Clases |
|---|---|
| Armazón | `.crm-shell`, `.crm-sidebar`, `.crm-nav-group`, `.crm-nav-label`, `.crm-nav-item`, `.crm-main`, `.crm-content` |
| Botones | `.crm-btn` con `-primary`, `-secondary`, `-danger`, `-danger-solid`; tamaños `-sm` (36 px), `-md` (40 px) y `-lg` (50 px); `.crm-icon-btn` (40 px) |
| Campos | `.crm-label`, `.crm-field` (46 px), `.crm-field-sm` (44 px), `.crm-textarea`, `.crm-field-group`, `.crm-field-error`, `.crm-checkbox` |
| Superficies | `.crm-card`, `.crm-card-raised`, `.crm-tile` |
| Etiquetas | `.crm-badge` con `-orange`, `-blue`, `-amber`, `-green`, `-gray`, `-red`, `-purple` |
| Selección | `.crm-chip` (36 px), `.crm-pill` (40 px), `.crm-segmented`, `.crm-segment`, `.crm-tabs`, `.crm-tab`, `.crm-option` |
| Avisos | `.crm-alert` con `-success`, `-warning`, `-danger` |
| Tablas | `.crm-table-wrap`, `.crm-table`, `.crm-sort` |
| Texto y utilidades | `.crm-title` (30 px), `.crm-heading` (18 px), `.crm-link`, `.crm-code`, `.crm-spinner`, `.crm-hit` |

Convenciones:

- Los modificadores se añaden junto a la clase base: `crm-btn crm-btn-primary`. `.crm-btn` mide 44 px sin modificador de tamaño.
- Las clases van en `@layer components`, para que las utilidades de Tailwind puedan sobrescribirlas.
- Los estados se leen de atributos: `aria-current="page"`, `aria-pressed="true"`, `aria-selected="true"`, `aria-invalid="true"` y `:disabled`.
- `.crm-option` usa `:has(input:checked)` para su estado elegido.
- El texto oculto accesible usa la utilidad `sr-only` de Tailwind.

## Plan de implementación

1. **Cambiar las fuentes.** En `app/layout.tsx`, sustituir Geist y Geist Mono por `Manrope` (`--font-manrope`) y `JetBrains_Mono` (`--font-jetbrains-mono`), y poner `lang="es"`. Actualizar `--font-sans` y `--font-mono` en `app/globals.css`, en `@theme inline`, y aplicar `--font-sans` al `body`.
2. **Crear los tokens.** Sustituir las variables actuales por los tokens de este spec en `@theme static` y eliminar el bloque `prefers-color-scheme: dark`. Mantener los alias `background` y `foreground`.
3. **Crear la base y los acentos.** En `@layer base`, definir `color-scheme: light`, fondo, texto, enlaces, foco visible (contorno de 2 px en `ink`, separación de 2 px) y los selectores `[data-accent]`.
4. **Crear `.crm-hit`.** Ampliar la zona de clic a 44 px con un pseudoelemento. La ampliación solo afecta a la dimensión menor de 44 px.
5. **Crear armazón y superficies.** Menú lateral y contenido en flex con salto de línea, como en las plantillas, sin media queries.
6. **Crear botones.** Hover con `brightness(0.92)` en primarios y fondo en los demás. Opacidad 0.45 y cursor `not-allowed` en deshabilitados.
7. **Crear campos.** Foco con borde `ink` y `--shadow-focus`; error con borde `danger`.
8. **Crear etiquetas y avisos.**
9. **Crear controles de selección.** Los chips y pills activos usan fondo `ink` y texto blanco; la pestaña activa usa una línea de `accent`.
10. **Crear tablas, texto y spinner.**
11. **Actualizar `CLAUDE.md`.** Añadir en Arquitectura los tokens, el prefijo `.crm-*`, `data-accent` y que solo hay modo claro. Es un archivo local, sin rastrear en git.

Los pasos 5 a 10 amplían con `.crm-hit`, o con sus mismas reglas, los controles menores de 44 px que crean.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npx prettier --check app/globals.css app/layout.tsx` termina sin errores.
- [ ] `app/globals.css` no contiene `prefers-color-scheme` y declara `color-scheme: light`.
- [ ] `app/layout.tsx` no menciona Geist, usa `lang="es"` y carga Manrope y JetBrains Mono con `next/font/google`.
- [ ] `app/globals.css` no contiene `@import` de Google Fonts.
- [ ] Todos los tokens de este spec aparecen en el CSS compilado con el valor indicado.
- [ ] Todas las clases de la sección Clases existen en `app/globals.css`, dentro de `@layer components`.
- [ ] Los selectores `[data-accent]` están en `@layer base` y definen los cuatro valores.
- [ ] Ninguna regla `.crm-*` contiene un color hexadecimal: todas usan tokens.
- [ ] Toda regla de foco que quita el `outline` define borde y `--shadow-focus`.
- [ ] `.crm-chip`, `.crm-pill`, `.crm-icon-btn`, `.crm-nav-item`, `.crm-segment`, `.crm-sort`, `.crm-btn-sm` y `.crm-btn-md` amplían su zona de clic a 44 px.
- [ ] `.crm-nav-group` separa sus elementos 4 px o más.
- [ ] `app/page.tsx` no cambia.

## Decisiones

- **Sí:** tokens, base y clases compartidas. Cubre lo repetido sin adelantar los componentes React.
- **Sí:** conservar el nombre `app/globals.css`. Ya existe y `app/layout.tsx` lo importa.
- **Sí:** todos los nombres en inglés, con prefijo `crm-` en las clases. Lo pidió el usuario y evita choques con Tailwind.
- **Sí:** solo modo claro. Las plantillas no definen una paleta oscura.
- **Sí:** cuatro acentos con `data-accent`. El selector y su persistencia van en otro spec.
- **Sí:** acentos en `@layer base`. `:root` y `[data-accent]` tienen la misma especificidad y `base` gana a `theme`.
- **Sí:** tonos por color y no por estado de negocio. Los comparten tickets, proyectos, servicios y roles.
- **Sí:** el tono `orange` no cambia con el acento. Representa un estado, no la marca.
- **Sí:** tamaño visual de las plantillas con zona de clic de 44 px. Concilia las plantillas con `LEEME.md`.
- **Sí:** separar 4 px los elementos del menú, en vez de los 2 px de las plantillas. Evita que se solapen sus zonas de 44 px.
- **Sí:** `@theme static`. Publica todos los tokens aunque ninguna pantalla los use todavía. Se comprobó con Tailwind 4.3.3.
- **Sí:** `next/font` y no `@import`. Evita peticiones a Google desde el navegador.
- **Sí:** no tocar `app/page.tsx`. Se acepta que se vea oscura en sistemas oscuros hasta que se reemplace.
- **No:** página `/estilos`. El usuario eligió comprobar solo con build y revisión.
- **No:** tokens para colores de uso puntual, como `#FBFBF8`, `#F6DAD5` o `#C9CDD2`. Se decidirán con su pantalla.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Sin página de muestra, no se comprueban el render, el hover ni el foco. | Revisarlos en el navegador en el spec de la primera pantalla. |
| Las zonas de 44 px de controles vecinos se solapan. | Separar los grupos al menos `44 px − tamaño`: 8 px entre filas de chips y 4 px entre botones de icono. |
| Los elementos `input` y `select` no admiten pseudoelementos. | No aplicarles `.crm-hit`. La etiqueta de `.crm-checkbox` debe medir 44 px de alto. |
| El build no puede descargar las fuentes de Google. | Repetirlo con conexión. `next/font` ya dependía de esa descarga con Geist. |

## Qué **no** está en este spec

- Modo oscuro.
- Componentes React y pantallas.
- Patrones de una sola pantalla.
- Selector de acento y su persistencia.
- Página de muestra.
- Cambios en `app/page.tsx` y en los metadatos.

Cada uno de estos puntos, si se aborda, va en su propio spec.
