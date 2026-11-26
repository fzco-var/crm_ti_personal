import type { Metadata } from "next";
import { ProjectCreateForm } from "@/features/projects/components/project-create-form";

export const metadata: Metadata = { title: "Nuevo proyecto" };

export default function NewProjectPage() {
  return <ProjectCreateForm />;
}
