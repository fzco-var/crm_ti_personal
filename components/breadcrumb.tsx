import Link from "next/link";
import { Fragment } from "react";

/** El último elemento es la página actual. */
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const last = items.length - 1;

  return (
    <nav
      aria-label="Ruta"
      className="flex flex-wrap items-center gap-1.5 text-compact text-ink-muted"
    >
      {items.map(({ label, href }, index) => (
        <Fragment key={label}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {index === last ? (
            <span aria-current="page" className="font-semibold text-ink">
              {label}
            </span>
          ) : href ? (
            <Link href={href} className="crm-hit text-ink-muted hover:text-ink">
              {label}
            </Link>
          ) : (
            <span>{label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
