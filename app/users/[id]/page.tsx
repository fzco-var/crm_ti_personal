import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roles } from "@/data/roles";
import { users } from "@/data/users";
import { UserEditForm } from "@/features/users/components/user-edit-form";
import { findUserById } from "@/features/users/utils";

export function generateStaticParams() {
  return users.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/users/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: findUserById(id) ? "Editar usuario" : "Usuario no encontrado",
  };
}

export default async function EditUserPage({
  params,
}: PageProps<"/users/[id]">) {
  const { id } = await params;
  const user = findUserById(id);
  if (!user) notFound();

  return <UserEditForm user={user} roles={roles} />;
}
