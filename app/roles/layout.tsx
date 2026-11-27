import { AppShell } from "@/components/app-shell";

export default function RolesLayout({ children }: LayoutProps<"/roles">) {
  return <AppShell active="roles">{children}</AppShell>;
}
