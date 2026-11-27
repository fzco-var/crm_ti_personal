"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToday } from "@/components/use-today";
import { ActiveProjects } from "@/features/dashboard/components/active-projects";
import { AttentionList } from "@/features/dashboard/components/attention-list";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardKpis } from "@/features/dashboard/components/dashboard-kpis";
import { RevenueByCompany } from "@/features/dashboard/components/revenue-by-company";
import { useCurrentHour } from "@/features/dashboard/use-current-hour";
import {
  getActiveProjects,
  getAttentionItems,
  getDashboardKpis,
  getRevenueByCompany,
} from "@/features/dashboard/utils";

function Dashboard() {
  const today = useToday();
  const hour = useCurrentHour();
  // Avisos marcados como resueltos; solo en esta visita.
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  function toggleResolved(id: string) {
    setResolvedIds((ids) =>
      ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id],
    );
  }

  if (today === null || hour === null) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando dashboard…
        </p>
      </div>
    );
  }

  const attention = getAttentionItems();
  const pendingCount = attention.items.filter(
    ({ id }) => !resolvedIds.includes(id),
  ).length;

  return (
    <div className="crm-content">
      <DashboardHeader today={today} hour={hour} pendingCount={pendingCount} />
      <DashboardKpis kpis={getDashboardKpis()} />
      <AttentionList
        items={attention.items}
        moreCount={attention.moreCount}
        resolvedIds={resolvedIds}
        onToggle={toggleResolved}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-6">
        <ActiveProjects projects={getActiveProjects()} />
        <RevenueByCompany rows={getRevenueByCompany().rows} />
      </div>
    </div>
  );
}

/** `bfcacheId` reinicia las casillas y el selector al entrar por un enlace, no con atrás. */
export function DashboardView() {
  const { bfcacheId } = useRouter();
  return <Dashboard key={bfcacheId} />;
}
