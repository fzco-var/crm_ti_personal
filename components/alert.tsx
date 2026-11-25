import type { ReactNode } from "react";
import {
  CloseIcon,
  ErrorIcon,
  SuccessIcon,
  WarningIcon,
} from "@/components/icons";

const VARIANTS = {
  success: {
    role: "status",
    className: "crm-alert-success items-center",
    Icon: SuccessIcon,
  },
  warning: {
    role: "note",
    className: "crm-alert-warning",
    Icon: WarningIcon,
  },
  danger: { role: "alert", className: "crm-alert-danger", Icon: ErrorIcon },
} as const;

export function Alert({
  variant,
  action,
  onClose,
  children,
}: {
  variant: keyof typeof VARIANTS;
  /** Enlace o botón a la derecha del texto. */
  action?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
}) {
  const { role, className, Icon } = VARIANTS[variant];

  return (
    <div role={role} className={`crm-alert ${className}`}>
      <Icon />
      <span className="min-w-0 flex-1">{children}</span>
      {action}
      {onClose && (
        <button
          type="button"
          className="crm-icon-btn size-9 text-inherit"
          aria-label="Cerrar aviso"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
