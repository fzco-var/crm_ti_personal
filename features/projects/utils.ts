import { clients } from "@/data/clients";
import { projects } from "@/data/projects";
import type { Project } from "@/features/projects/types/project";

export function findProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

/** La empresa del proyecto es la de su contacto principal. */
export function getProjectCompany({ clientId }: Pick<Project, "clientId">) {
  return clients.find(({ id }) => id === clientId)?.company ?? "";
}

/** Clientes de la empresa del proyecto, con el contacto principal primero. */
export function getProjectContacts(project: Pick<Project, "clientId">) {
  const company = getProjectCompany(project);
  const contacts = clients.filter((client) => client.company === company);
  return [
    ...contacts.filter(({ id }) => id === project.clientId),
    ...contacts.filter(({ id }) => id !== project.clientId),
  ];
}
