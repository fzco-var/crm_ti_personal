import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { CURRENT_USER_ID } from "@/features/users/constants";
import { getFullName } from "@/features/users/utils";
import type { RoleUser } from "@/features/roles/utils";
import { getInitials } from "@/lib/text";

/** Usuarios con el rol, enlazados a su edición. */
export function RoleUsers({ users }: { users: RoleUser[] }) {
  return (
    <section aria-label="Usuarios con este rol" className="crm-card gap-3 p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">Usuarios con este rol</h2>
        <span className="font-mono text-compact text-ink-muted">
          {users.length}
        </span>
      </div>

      {users.length === 0 ? (
        <span className="text-compact leading-[1.45] text-ink-muted">
          Nadie tiene este rol todavía. Asígnalo desde{" "}
          <Link href="/users" className="font-bold text-ink-soft underline">
            Usuarios
          </Link>
          .
        </span>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/users/${user.id}`}
                className="-mx-2 flex min-h-12 items-center gap-2.5 rounded-control px-2 py-1.5 text-ink hover:bg-surface-hover"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-8 flex-none items-center justify-center rounded-full font-mono text-2xs ${
                    user.id === CURRENT_USER_ID
                      ? "bg-ink text-ink-inverse"
                      : "bg-canvas text-ink-soft"
                  }`}
                >
                  {getInitials(user.firstName, user.lastName)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold">
                    {getFullName(user)}
                  </span>
                  <span className="truncate font-mono text-xs text-ink-muted">
                    @{user.username}
                  </span>
                </span>
                <ChevronRightIcon className="flex-none text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
