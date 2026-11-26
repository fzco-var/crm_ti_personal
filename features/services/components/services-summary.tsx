import type { Service } from "@/features/services/types/service";
import { formatCLP, getServicesSummary } from "@/features/services/utils";

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function getManualText(count: number) {
  if (count === 0) return "Todas son automáticas";
  return count === 1
    ? "1 necesita que la renueves tú"
    : `${count} necesitan que las renueves tú`;
}

/** Indicadores del listado; solo cuentan los servicios activos. */
export function ServicesSummary({ services }: { services: Service[] }) {
  const summary = getServicesSummary(services);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
      <div className="crm-tile crm-tile-dark">
        <span className="text-compact font-semibold text-ink-inverse-muted">
          Ingreso recurrente mensual
        </span>
        <span className="font-mono text-[26px] leading-[1.1] font-medium">
          {formatCLP(summary.revenue)}
        </span>
        <span className="text-xs text-ink-inverse-muted">
          {plural(summary.activeCount, "servicio activo", "servicios activos")}{" "}
          · {plural(summary.companyCount, "cliente", "clientes")}
        </span>
      </div>

      <div className="crm-tile">
        <span className="text-compact font-semibold text-ink-soft">
          Costo mensual de proveedores
        </span>
        <span className="font-mono text-[26px] leading-[1.1] font-medium">
          {formatCLP(summary.cost)}
        </span>
        <span className="text-xs text-ink-muted">Hosting, dominios y APIs</span>
      </div>

      <div className="crm-tile">
        <span className="text-compact font-semibold text-ink-soft">
          Margen mensual
        </span>
        <span className="font-mono text-[26px] leading-[1.1] font-medium text-tone-green-fg">
          {formatCLP(summary.margin)}
        </span>
        <span className="text-xs text-ink-muted">
          {summary.marginPercent}% de lo que cobras
        </span>
      </div>

      <div className="crm-tile">
        <span className="text-compact font-semibold text-ink-soft">
          Renuevan en 30 días
        </span>
        <span className="font-mono text-[26px] leading-[1.1] font-medium">
          {summary.upcomingCount}
        </span>
        <span className="text-xs text-ink-muted">
          {getManualText(summary.manualUpcomingCount)}
        </span>
      </div>
    </div>
  );
}
