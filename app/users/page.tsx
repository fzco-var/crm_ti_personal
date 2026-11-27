import type { Metadata } from "next";
import { roles } from "@/data/roles";
import { users } from "@/data/users";
import { UsersList } from "@/features/users/components/users-list";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsersPage() {
  return <UsersList users={users} roles={roles} />;
}
