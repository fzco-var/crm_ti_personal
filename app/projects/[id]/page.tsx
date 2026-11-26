import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectEditForm } from "@/features/projects/components/project-edit-form";
import { findProjectById } from "@/features/projects/utils";

export function generateStaticParams() {
  return projects.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findProjectById(id) ? "Editar proyecto" : "Proyecto no encontrado",
  };
}

export default async function EditProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = findProjectById(id);
  if (!project) notFound();

  return <ProjectEditForm project={project} />;
}
