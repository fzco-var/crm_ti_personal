# CLAUDE.md

Este archivo ofrece orientación a Claude Code (claude.ai/code) para trabajar con el código de este repositorio.

CRM personal para un negocio de servicios de TI (clientes, proyectos, tickets, servicios, usuarios/roles). Next.js 16 con App Router, React 19, Tailwind 4 y Prisma 7 sobre PostgreSQL. Los textos de la interfaz y las referencias de diseño están en español. El proyecto está en fase inicial: `app/page.tsx` sigue siendo la página de create-next-app.

`AGENTS.md` lo genera `next dev` y está en `.gitignore`, así que puede faltar en un clon nuevo. Su regla: leer la guía correspondiente en `node_modules/next/dist/docs/` antes de escribir código de Next.js.

## Comandos

```bash
npm run dev
npm run build
npx eslint app/layout.tsx lib      # lint de rutas específicas
npx tsc --noEmit
npx prisma validate
npx prisma generate                # el build no lo ejecuta; repetir tras cambiar el esquema
npx prisma migrate dev             # ver la nota sobre las URL en la sección Prisma
```

`npm run lint` cubre todo el repositorio, incluido `app/generated/prisma`, que está en `.gitignore` pero no en los ignores de ESLint. Si esa carpeta existe, produce cientos de errores irrelevantes, así que conviene hacer lint de rutas específicas.

No hay ningún ejecutor de pruebas configurado.

## Arquitectura

- `app/`: rutas. `features/<dominio>/{actions,components,types}`: código de dominio (por ahora `clients` y `tickets`). Estas carpetas de features y de rutas están vacías y por eso git no las rastrea.
- `lib/db.ts`: el singleton `db` de Prisma, guardado en `globalThis` para la recarga en caliente en desarrollo.
- `@/*` apunta a la raíz del repositorio (no hay `src/`).
- `next.config.ts` activa `cacheComponents` y `partialPrefetching`, que cambian el funcionamiento de la caché, los datos dinámicos y el prefetching. Tailwind se ejecuta como loader de Turbopack (`@tailwindcss/turbopack`), no mediante PostCSS.

## Prisma

- La configuración está en `prisma7.config.ts`, no en `prisma.config.ts`. Carga `.env` con `dotenv`, que solo está presente como dependencia transitiva.
- `.env` tiene `DATABASE_URL` (con pooler, para la app en runtime) y `DIRECT_URL` (sin pooler, para migraciones por CLI). Actualmente la configuración le pasa `DATABASE_URL` a la CLI.
- Todavía no existe la carpeta `prisma/migrations`.
- El generador es `prisma-client-js` sin `output`, y el código importa desde `@prisma/client`. `app/generated/prisma` es un resto generado a partir de un esquema anterior; no importar desde ahí.
- Prisma 7 exige un driver adapter: `new PrismaClient()` en `lib/db.ts` lanza un error tal como está escrito, y no hay ningún adapter instalado.
- Los nombres del esquema usan snake_case y mezclan modelos en singular y plural (`client`, `project`, `rol`, `services`, `tickets`, `users`); los ID son `id_<entidad>`. Todas las relaciones usan `onDelete: NoAction`, así que al borrar hay que tratar explícitamente los registros dependientes.
- Los ID se están migrando de `Int` autoincremental a cadenas `@db.Uuid` (`gen_random_uuid()`). Las claves foráneas deben ser `String? @db.Uuid` para coincidir; hasta convertirlas todas, `prisma validate` falla.

## Referencias de diseño

`references/CRM-TI-templates/` (solo local, en `.gitignore`) contiene los diseños de las pantallas. Su `LEEME.md` relaciona cada plantilla con una ruta sugerida y detalla colores, tipografías y tamaños mínimos; leerlo antes de construir la interfaz.

- Los archivos `.dc.html` no se ven bien en el navegador. Hay que portar a JSX el marcado con estilos en línea: `{{x}}` es un valor o manejador, `<sc-if>` un condicional, `<sc-for>` una lista, y el script `text/x-dc` contiene el estado, las validaciones y los datos de ejemplo.
- El flujo de login elegido es `LoginC-Cuenta` → `LoginC` → `LoginC-Codigo` (cuenta, contraseña, 2FA). `Main`, `Verificacion`, `LoginB` y `LoginD` están descartados.
- Las rutas sugeridas están en español (`/clientes`, `/proyectos`, `/configuracion/usuarios`), mientras que la carpeta vacía existente es `app/clients`.
