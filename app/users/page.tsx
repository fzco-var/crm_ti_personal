import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios" };

// El listado se conecta en el paso 8 del SPEC 07.
export default function UsersPage() {
  return <h1 className="crm-title">Usuarios</h1>;
}
