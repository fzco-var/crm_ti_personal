import { AppShell } from "@/components/app-shell";

export default function ClientsLayout({ children }: LayoutProps<"/clients">) {
  return <AppShell active="clients">{children}</AppShell>;
}
