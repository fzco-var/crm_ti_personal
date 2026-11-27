import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { users } from "@/data/users";
import { findUserById, getFullName } from "@/features/users/utils";

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

  // La edición se conecta en el paso 13 del SPEC 07.
  return <h1 className="crm-title">{getFullName(user)}</h1>;
}
