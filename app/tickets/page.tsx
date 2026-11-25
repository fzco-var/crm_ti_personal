import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <div className="crm-content">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={[{ label: "Operación" }, { label: "Tickets" }]} />
        <h1 className="crm-title">Tickets</h1>
      </div>
    </div>
  );
}
