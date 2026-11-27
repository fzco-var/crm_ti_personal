import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roles } from "@/data/roles";
import { RoleEditForm } from "@/features/roles/components/role-edit-form";
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

export default async function EditRolePage({
  params,
}: PageProps<"/roles/[id]">) {
  const { id } = await params;
  const role = findRoleById(id);
  if (!role) notFound();

  return <RoleEditForm role={role} />;
}
