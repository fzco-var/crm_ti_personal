import Link from "next/link";
import type { ReactNode } from "react";
import {
  ClientsIcon,
  DashboardIcon,
  LogoIcon,
  ProjectsIcon,
  RolesIcon,
  ServicesIcon,
  SettingsIcon,
  TicketsIcon,
  UsersIcon,
} from "@/components/icons";

// Los elementos sin `href` se muestran deshabilitados: su pantalla no existe.
const NAV_GROUPS = [
  {
    label: "Operación",
    items: [
      { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
      {
        id: "clients",
        label: "Clientes",
        Icon: ClientsIcon,
        href: "/clients",
      },
      {
        id: "services",
        label: "Servicios",
        Icon: ServicesIcon,
        href: "/services",
      },
      {
        id: "tickets",
        label: "Tickets",
        Icon: TicketsIcon,
        href: "/tickets",
      },
      {
        id: "projects",
        label: "Proyectos",
        Icon: ProjectsIcon,
        href: "/projects",
      },
    ],
  },
  {
    label: "Configuración",
    items: [
      { id: "users", label: "Usuarios", Icon: UsersIcon, href: "/users" },
      { id: "roles", label: "Roles y permisos", Icon: RolesIcon },
      { id: "settings", label: "Ajustes", Icon: SettingsIcon },
    ],
  },
] as const;

type NavItemId = (typeof NAV_GROUPS)[number]["items"][number]["id"];

export function AppShell({
  active,
  children,
}: {
  active: NavItemId;
  children: ReactNode;
}) {
  return (
    <div className="crm-shell">
      <nav aria-label="Principal" className="crm-sidebar">
        <span className="flex items-center gap-2.5 px-2 text-brand font-bold tracking-[-0.01em]">
          <span className="flex size-[30px] items-center justify-center rounded-lg bg-ink text-white">
            <LogoIcon />
          </span>
          CRM TI
        </span>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="crm-nav-group">
            <span className="crm-nav-label">{group.label}</span>
            {group.items.map(({ id, label, Icon, ...item }) =>
              "href" in item ? (
                <Link
                  key={id}
                  href={item.href}
                  className="crm-nav-item"
                  aria-current={id === active ? "page" : undefined}
                >
                  <Icon />
                  {label}
                </Link>
              ) : (
                <a
                  key={id}
                  role="link"
                  aria-disabled="true"
                  className="crm-nav-item"
                >
                  <Icon />
                  {label}
                </a>
              ),
            )}
          </div>
        ))}

        <div className="mt-auto flex items-center gap-2.5 rounded-control border border-line bg-surface p-2.5">
          <span className="flex size-[34px] flex-none items-center justify-center rounded-full bg-ink font-mono text-xs text-white">
            MV
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-compact font-bold">Martín Vidal</span>
            <span className="text-xs text-ink-muted">Administrador</span>
          </span>
        </div>
      </nav>

      <main className="crm-main">{children}</main>
    </div>
  );
}
