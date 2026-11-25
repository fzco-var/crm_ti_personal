# SPEC 01 — ID en UUID y migración a Neon

> **Estado:** Implementado
> **Depende de:** ninguno
> **Fecha:** 2026-11-24
> **Objetivo:** Que las 6 tablas de Neon usen UUID en todos sus ID y relaciones, con historial de migraciones y un cliente de Prisma capaz de consultarlas.

## Por qué existe este spec

El commit `6689788` convirtió las claves primarias a UUID, pero no las foráneas.
Por eso `npx prisma validate` falla con 7 errores.

Estado comprobado en Neon el 2026-11-24:

- PostgreSQL 18.7.
- Las tablas `client`, `project`, `rol`, `services`, `tickets` y `users` tienen 0 filas.
- Todos los ID son `integer` sin valor por defecto.
- No existe la tabla `_prisma_migrations`.

## Alcance

**Incluye:**

- Convertir 7 claves foráneas en `prisma/schema.prisma`.
- Usar `DIRECT_URL` para la CLI en `prisma7.config.ts`.
- Declarar `dotenv` en `devDependencies`.
- Crear las migraciones `0_init` y `1_uuid_ids`.
- Ensayar en una rama de Neon y después aplicar a la base principal.
- Instalar `@prisma/adapter-pg` y usarlo en `lib/db.ts`.
- Agregar `"postinstall": "prisma generate"` a los scripts de `package.json`.
- Borrar `app/generated/prisma`, resto del cliente anterior.
- Actualizar `CLAUDE.md` (archivo local, sin rastrear en git).

**Fuera de alcance:**

- Cambiar el generador `prisma-client-js`.
- Renombrar modelos o columnas.
- Cargar datos iniciales (seed).
- Cambiar los ignores de ESLint.

## Modelo de datos

No hay modelos nuevos. Las 6 claves primarias ya están correctas y no cambian.

Estas claves foráneas pasan de `Int?` a `String? @db.Uuid`:

| Modelo | Campo | Referencia |
|---|---|---|
| `client` | `id_rol` | `rol.id_rol` |
| `project` | `id_client` | `client.id_client` |
| `services` | `id_client` | `client.id_client` |
| `services` | `id_project` | `project.id_project` |
| `tickets` | `id_project` | `project.id_project` |
| `tickets` | `assignee_id` | `users.id_user` |
| `users` | `id_rol` | `rol.id_rol` |

Convenciones:

- Los ID los genera la base con `gen_random_uuid()`.
- Las relaciones conservan `onDelete: NoAction` y `onUpdate: NoAction`.
- `charge_client` y `cost` siguen siendo `Int`: no son ID.

## Plan de implementación

1. **Configurar la CLI.** Apuntar `datasource.url` a `process.env["DIRECT_URL"]` en `prisma7.config.ts` y agregar `dotenv` a `devDependencies`.
2. **Corregir el esquema.** Cambiar las 7 claves foráneas. Comprobar que `npx prisma validate` pasa.
3. **Crear la base.** Generar `prisma/migrations/0_init/migration.sql` con `prisma migrate diff` desde vacío hasta la base actual, sin modificar Neon. Crear también `prisma/migrations/migration_lock.toml` con proveedor `postgresql`.
4. **Crear el cambio.** Generar `prisma/migrations/1_uuid_ids/migration.sql` con `prisma migrate diff` desde la base actual hasta `prisma/schema.prisma`, sin modificar Neon. Revisar el SQL: solo debe tocar columnas de ID, claves primarias y claves foráneas.
5. **Preparar el ensayo.** El usuario crea en la consola de Neon una rama a partir de la principal y guarda sus URL como `DATABASE_URL` y `DIRECT_URL` en `.env.ensayo`, cubierto por `.env*` en `.gitignore`. Cargar esas variables en el proceso que ejecuta la CLI, sin editar `.env`.
6. **Ensayar.** Confirmar que el host es el de la rama y que las 6 tablas tienen 0 filas. Ejecutar `prisma migrate resolve --applied 0_init` y después `prisma migrate deploy`. Verificar con `migrate status`, un `migrate diff` vacío y una inserción con rollback.
7. **Aplicar a la principal.** Pedir confirmación explícita al usuario. Confirmar que el host es el de `.env` y que las 6 tablas tienen 0 filas; si alguna tiene datos, detenerse. Repetir los comandos del paso 6.
8. **Conectar el cliente.** Instalar `@prisma/adapter-pg` en la misma versión que `@prisma/client`. Pasar a `PrismaClient` en `lib/db.ts` un `PrismaPg` con `DATABASE_URL`, conservando el singleton y el import de `@prisma/client`. Ejecutar `npx prisma generate`. Después, agregar `"postinstall": "prisma generate"` a `package.json`.
9. **Borrar el cliente anterior.** Confirmar de nuevo que ningún archivo importa desde `app/generated/prisma`. Eliminar `app/generated`, que solo contiene esa carpeta; si contiene algo más, eliminar únicamente `app/generated/prisma`. Conservar la línea de `.gitignore`.
10. **Actualizar `CLAUDE.md`.** Quitar las notas sobre `app/generated/prisma` y corregir en la sección Prisma las notas sobre URL de la CLI, `dotenv`, migraciones, adapter, `postinstall` e ID. Actualizar el comentario sobre `migrate dev` y la descripción de `lib/db.ts` si corresponde.

## Criterios de aceptación

- [x] `npx prisma validate` termina sin errores.
- [x] Ninguna columna de ID o clave foránea del esquema es `Int`.
- [x] `prisma7.config.ts` usa `DIRECT_URL`.
- [x] `package.json` declara `dotenv` y `@prisma/adapter-pg`.
- [x] `prisma/migrations` contiene `0_init`, `1_uuid_ids` y `migration_lock.toml`.
- [x] La rama de ensayo pasó todas las verificaciones antes de tocar la principal.
- [x] `npx prisma migrate status` indica que la base principal está al día.
- [x] `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` termina con código 0 en la principal.
- [x] Las 13 columnas de ID y claves foráneas son `uuid` en la principal.
- [x] Una inserción de prueba en `rol` sin `id_rol` devuelve un UUID y su rollback deja 0 filas.
- [x] Una consulta `db.rol.count()` mediante `lib/db.ts` devuelve 0 sin errores.
- [x] Tras `npm ci`, sin ejecutar `prisma generate` a mano, `npx tsc --noEmit` pasa y el cliente generado tiene ID `String`.
- [x] `npx prisma generate` termina sin errores aunque `DIRECT_URL` no esté definida.
- [x] `app/generated/prisma` no existe y ningún archivo de código importa desde esa ruta.
- [x] `npx tsc --noEmit` y `npx eslint lib prisma7.config.ts` terminan sin errores.
- [x] `npm run build` termina sin errores.
- [x] `.env` y `.env.ensayo` no aparecen en `git status`.
- [x] La sección Prisma de `CLAUDE.md` describe el estado nuevo.

## Decisiones

- **Sí:** base `0_init` más `1_uuid_ids`. Conserva el historial y evita un reset.
- **No:** `migrate dev` directo. Detectaría drift y pediría un reset.
- **No:** reset con una sola migración. Es destructivo e innecesario.
- **Sí:** ensayo en una rama de Neon. Permite comprobar el SQL sin tocar la principal.
- **Sí:** incluir el adapter. Sin él, `new PrismaClient()` falla en Prisma 7.
- **Sí:** `DIRECT_URL` para la CLI y `DATABASE_URL` para la app. El pooler no es adecuado para migraciones.
- **Sí:** eliminar y recrear columnas. Solo es válido porque no hay filas.
- **Sí:** aceptar la pérdida de `DEFERRABLE` en las claves foráneas. Prisma no lo representa.
- **Sí:** aceptar que las columnas recreadas queden al final. El orden no afecta a Prisma.
- **Sí:** borrar `app/generated/prisma`. Quedó al quitar `output` en `e36e54d`, contiene ID `Int` y nada la importa.
- **Sí:** borrarla después de verificar el cliente nuevo. Así la limpieza no se mezcla con la migración.
- **Sí:** agregar `postinstall` en el paso 8. Antes de corregir el esquema haría fallar `npm install`.
- **Sí:** leer `process.env["DIRECT_URL"]`. `env("DIRECT_URL")` falla si la variable no existe y rompería la instalación en CI.
- **Sí:** mantener `prisma` y `dotenv` en `devDependencies`. Se asume que el build instala las dependencias de desarrollo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Aparecen filas antes de migrar y se pierden ID o relaciones. | Contar filas justo antes de cada aplicación y detenerse si hay alguna. |
| La CLI apunta a la base equivocada. | Comprobar el host antes de cada comando que escribe. |
| `migrate deploy` falla en la principal. | Detenerse, inspeccionar el estado y usar `migrate resolve` solo tras diagnosticar. No ejecutar reset. |
| Instalar con `--omit=dev` hace fallar `postinstall`. | No usar esa opción. Si el deploy la exige, mover `prisma` y `dotenv` a `dependencies`. |
| El cliente queda desactualizado al editar el esquema. | Ejecutar `npx prisma generate` manualmente, documentado en `CLAUDE.md`. |

## Qué **no** está en este spec

- Cambio de generador.
- Renombrado de modelos o columnas.
- Seed de datos.
- Cambios en los ignores de ESLint.

Cada uno de estos puntos, si se aborda, va en su propio spec.
