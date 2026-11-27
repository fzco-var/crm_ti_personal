import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roles } from "@/data/roles";
import { findRoleById } from "@/features/roles/utils";

export function generateStaticParams() {
  return roles.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/roles/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: findRoleById(id) ? "Editar rol" : "Rol no encontrado" };
}

// El formulario de edición se conecta en el paso 13 del SPEC 08.
export default async function EditRolePage({
  params,
}: PageProps<"/roles/[id]">) {
  const { id } = await params;
  const role = findRoleById(id);
  if (!role) notFound();

  return null;
}
