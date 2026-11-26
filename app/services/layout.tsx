import { AppShell } from "@/components/app-shell";

export default function ServicesLayout({ children }: LayoutProps<"/services">) {
  return <AppShell active="services">{children}</AppShell>;
}
