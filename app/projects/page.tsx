import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { ProjectsList } from "@/features/projects/components/projects-list";

export const metadata: Metadata = { title: "Proyectos" };

export default function ProjectsPage() {
  return <ProjectsList projects={projects} />;
}
