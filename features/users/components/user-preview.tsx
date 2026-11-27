"use client";

import { useId, type ReactNode } from "react";
import { getRoleName } from "@/features/roles/utils";
import type { UserCreateValues } from "@/features/users/types/user";
import { getInitials } from "@/lib/text";

/** `username` es el efectivo: el sugerido mientras no se edite el campo. */
export function UserPreview({ values }: { values: UserCreateValues }) {
  const headingId = useId();
  const fullName =
    `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
  const passwordText = values.password
    ? values.forcePasswordChange
      ? "Temporal · cambio obligatorio"
      : "Definida"
    : "—";

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Vista previa
      </h2>
      <div className="flex items-center gap-3">
        <span className="flex size-11 flex-none items-center justify-center rounded-full bg-canvas font-mono text-sm font-medium text-ink-soft">
          {getInitials(values.firstName, values.lastName)}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-field font-bold">
            {fullName || "Nombre Apellido"}
          </span>
          <span className="truncate font-mono text-compact text-ink-muted">
            @{values.username || "usuario"}
          </span>
        </span>
      </div>
      <dl className="flex flex-col gap-3 text-compact">
        <PreviewItem label="Email" className="truncate">
          {values.email || "—"}
        </PreviewItem>
        <PreviewItem label="Contraseña">{passwordText}</PreviewItem>
        <PreviewItem label="Rol" className="font-bold">
          {getRoleName(values.roleId) || "Sin elegir"}
        </PreviewItem>
      </dl>
      <div className="flex flex-col gap-2 border-t border-line-soft pt-4">
        <span className="text-compact font-bold">Qué pasa al crear</span>
        <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-compact leading-[1.45] text-ink-soft">
          <li>
            La contraseña se guarda cifrada. Después nadie podrá verla, ni tú.
          </li>
          <li>Comparte la contraseña inicial por un canal seguro.</li>
          <li>Tendrá que configurar su verificación en dos pasos al entrar.</li>
        </ul>
      </div>
    </aside>
  );
}

function PreviewItem({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="flex-none text-ink-muted">{label}</dt>
      <dd className={`min-w-0 text-right text-ink ${className}`}>{children}</dd>
    </div>
  );
}
