import { AppShell } from "@/components/app-shell";

export default function TicketsLayout({ children }: LayoutProps<"/tickets">) {
  return <AppShell active="tickets">{children}</AppShell>;
}
