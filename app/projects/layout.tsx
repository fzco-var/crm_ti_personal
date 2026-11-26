import { AppShell } from "@/components/app-shell";

export default function ProjectsLayout({ children }: LayoutProps<"/projects">) {
  return <AppShell active="projects">{children}</AppShell>;
}
