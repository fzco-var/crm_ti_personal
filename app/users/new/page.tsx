import type { Metadata } from "next";
import { roles } from "@/data/roles";
import { UserCreateForm } from "@/features/users/components/user-create-form";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default function NewUserPage() {
  return <UserCreateForm roles={roles} />;
}
