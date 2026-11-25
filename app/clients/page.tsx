import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientsPage() {
  return (
    <div className="crm-content max-w-[1240px]">
      <h1 className="crm-title">Clientes</h1>
    </div>
  );
}
