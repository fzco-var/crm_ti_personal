import { ClockIcon } from "@/components/icons";
import { RENEWAL_URGENT_DAYS } from "@/features/services/constants";
import type { Service } from "@/features/services/types/service";
import {
  formatCLP,
  getServiceCompany,
  getUpcomingRenewals,
} from "@/features/services/utils";

/** Activos que renuevan en 30 días; se oculta si no hay ninguno. */
export function UpcomingRenewals({
  services,
  onRenew,
}: {
  services: Service[];
  onRenew: (service: Service) => void;
}) {
  const upcoming = getUpcomingRenewals(services);
  if (upcoming.length === 0) return null;

  return (
    <section
      aria-labelledby="upcoming-renewals-title"
      className="flex flex-col gap-3 rounded-tile border border-tone-amber-line bg-tone-amber-bg px-5 py-[18px]"
    >
      <h2
        id="upcoming-renewals-title"
        className="flex items-center gap-2 text-field font-bold text-tone-amber-fg"
      >
        <ClockIcon className="text-tone-amber-dot" />
        Próximas renovaciones (30 días)
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-2">
        {upcoming.map((service) => (
          <li
            key={service.id}
            className="flex items-center gap-3 rounded-control border border-tone-amber-line bg-surface px-3 py-2.5"
          >
            <span
              className={`w-[46px] flex-none text-center font-mono text-compact font-bold ${
                service.renewInDays <= RENEWAL_URGENT_DAYS
                  ? "text-danger"
                  : "text-warning"
              }`}
            >
              {service.renewInDays === 0 ? "hoy" : `${service.renewInDays} d`}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-compact font-bold text-ink">
                {service.name}
              </span>
              <span className="text-xs text-ink-muted">
                {getServiceCompany(service)} · {formatCLP(service.charge)} /{" "}
                {service.period}
              </span>
            </span>
            {service.autoRenew ? (
              <span className="flex-none text-xs font-semibold text-ink-muted">
                Automática
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onRenew(service)}
                aria-label={`Registrar renovación de ${service.name}`}
                className="crm-btn crm-btn-sm flex-none border-tone-amber-line bg-surface px-2.5 text-xs text-tone-amber-fg hover:bg-tone-amber-bg"
              >
                Registrar renovación
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
