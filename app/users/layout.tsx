import { AppShell } from "@/components/app-shell";

export default function UsersLayout({ children }: LayoutProps<"/users">) {
  return <AppShell active="users">{children}</AppShell>;
}
