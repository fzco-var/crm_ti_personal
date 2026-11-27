import type { Metadata } from "next";
import { RoleCreateForm } from "@/features/roles/components/role-create-form";

export const metadata: Metadata = { title: "Crear rol" };

export default function NewRolePage() {
  return <RoleCreateForm />;
}
