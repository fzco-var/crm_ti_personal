import type { ComponentProps } from "react";

type IconProps = Omit<ComponentProps<"svg">, "children"> & { size?: number };

function Icon({
  size = 16,
  strokeWidth = 2,
  ...props
}: ComponentProps<"svg"> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-hidden="true"
    />
  );
}

export function LogoIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M5 8l4 4-4 4" />
      <path d="M12 16h7" />
    </Icon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  );
}

export function ClientsIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
      <path d="M18 14c2 .6 3 2.8 3 6" />
    </Icon>
  );
}

export function ServicesIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </Icon>
  );
}

export function TicketsIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M10 5v12" />
    </Icon>
  );
}

export function ProjectsIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M15 4v10" />
    </Icon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </Icon>
  );
}

export function RolesIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M4.9 4.9l2.1 2.1" />
      <path d="M17 17l2.1 2.1" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M4.9 19.1L7 17" />
      <path d="M17 7l2.1-2.1" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon size={18} fill="currentColor" stroke="none" {...props}>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </Icon>
  );
}

export function SuccessIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </Icon>
  );
}

export function ErrorIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon size={18} {...props}>
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Icon size={14} strokeWidth={2.2} {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon size={12} strokeWidth={2.4} {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M5 12l5 5L20 7" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon size={14} {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon size={18} strokeWidth={1.8} {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </Icon>
  );
}
