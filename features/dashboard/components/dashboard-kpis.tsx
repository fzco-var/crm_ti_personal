import Link from "next/link";
import type { ReactNode } from "react";
import type { getDashboardKpis } from "@/features/dashboard/utils";
import { formatCLP } from "@/features/services/utils";

type DashboardKpis = ReturnType<typeof getDashboardKpis>;

function plural(count: number, singular: string, pluralText: string) {
  return `${count} ${count === 1 ? singular : pluralText}`;
}

function KpiTile({
  href,
  label,
  value,
  detail,
  dark = false,
  valueClassName = "",
}: {
  href: string;
  label: string;
  value: ReactNode;
  detail: ReactNode;
  dark?: boolean;
  valueClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={`crm-tile ${dark ? "crm-tile-dark" : "hover:border-line-strong"}`}
    >
      <span
        className={`text-compact font-semibold ${dark ? "text-ink-inverse-muted" : "text-ink-soft"}`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-[28px] leading-[1.1] font-medium ${valueClassName}`}
      >
        {value}
      </span>
      {detail}
    </Link>
  );
}

export function DashboardKpis({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
      <KpiTile
        href="/services"
        dark
        label="Ingreso recurrente mensual"
        value={formatCLP(kpis.revenue)}
        detail={
          <span className="text-xs text-ink-inverse-muted">
            Margen {formatCLP(kpis.margin)} · {kpis.marginPercent}%
          </span>
        }
      />
      <KpiTile
        href="/services"
        label="Por cobrar"
        value={formatCLP(kpis.pendingAmount)}
        valueClassName="text-tone-orange-fg"
        detail={
          <span className="text-xs text-ink-muted">
            {kpis.pendingCount === 0
              ? "Sin cobros pendientes"
              : plural(
                  kpis.pendingCount,
                  "cobro pendiente",
                  "cobros pendientes",
                )}
          </span>
        }
      />
      <KpiTile
        href="/tickets"
        label="Tickets sin cerrar"
        value={kpis.openTicketCount}
        detail={
          <span className="text-xs text-ink-muted">
            {plural(kpis.newTicketCount, "abierto", "abiertos")} ·{" "}
            {kpis.highPriorityCount} de prioridad alta
          </span>
        }
      />
      <KpiTile
        href="/projects"
        label="Proyectos activos"
        value={kpis.activeProjectCount}
        detail={
          kpis.overdueProjectCount === 0 ? (
            <span className="text-xs text-ink-muted">Ninguno atrasado</span>
          ) : (
            <span className="text-xs font-bold text-danger">
              {plural(kpis.overdueProjectCount, "atrasado", "atrasados")}
            </span>
          )
        }
      />
    </div>
  );
}
