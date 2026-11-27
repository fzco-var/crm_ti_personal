import type { Metadata } from "next";
import { roles } from "@/data/roles";
import { RolesList } from "@/features/roles/components/roles-list";

export const metadata: Metadata = { title: "Roles y permisos" };

export default function RolesPage() {
  return <RolesList roles={roles} />;
}
