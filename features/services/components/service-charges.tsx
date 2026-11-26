"use client";

import { useId } from "react";
import { TONE_CLASSES } from "@/components/tone";
import type { ServiceCharge } from "@/features/services/types/service";
import {
  formatCLP,
  getChargePeriod,
  getChargesSummary,
} from "@/features/services/utils";

function getPendingText(count: number, amount: number) {
  const label =
    count === 1 ? "1 cobro pendiente" : `${count} cobros pendientes`;
  return `${label} · ${formatCLP(amount)}`;
}

/**
 * Cobros del más reciente al más antiguo. "Marcar pagado" actúa al instante y
 * no cuenta como cambio del formulario.
 */
export function ServiceCharges({
  charges,
  paidToday,
  today,
  disabled,
  onMarkPaid,
}: {
  charges: ServiceCharge[];
  /** `monthsAgo` de los cobros marcados como pagados en esta visita. */
  paidToday: number[];
  today: string;
  disabled?: boolean;
  onMarkPaid: (charge: ServiceCharge) => void;
}) {
  const id = useId();
  const { pendingCount, pendingAmount } = getChargesSummary(charges);

  return (
    <section aria-labelledby={`${id}-heading`} className="crm-card gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-heading`} className="crm-heading">
          Cobros al cliente
        </h2>
        <span
          className={`text-compact font-bold ${
            pendingCount ? "text-tone-orange-fg" : "text-tone-green-fg"
          }`}
        >
          {pendingCount
            ? getPendingText(pendingCount, pendingAmount)
            : "Todo al día"}
        </span>
      </div>

      {charges.length === 0 ? (
        <p className="text-sm text-ink-muted">Aún no hay cobros registrados.</p>
      ) : (
        <div className="crm-table-wrap rounded-xl border border-line">
          <table className="crm-table min-w-[520px]">
            <thead>
              <tr>
                <th scope="col" className="py-2.5">
                  Periodo
                </th>
                <th scope="col" className="py-2.5">
                  Monto
                </th>
                <th scope="col" className="py-2.5">
                  Estado
                </th>
                {/* `relative` evita que el texto oculto desborde la página. */}
                <th scope="col" className="relative w-[150px] py-2.5">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => {
                const period = getChargePeriod(today, charge.monthsAgo);
                const paid = charge.paidDay !== null;
                return (
                  <tr key={charge.monthsAgo}>
                    <th scope="row" className="py-3 font-semibold">
                      {period}
                    </th>
                    <td className="py-3 font-mono">
                      {formatCLP(charge.amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`crm-badge ${TONE_CLASSES[paid ? "green" : "orange"]}`}
                      >
                        {paid ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {paid ? (
                        <span className="text-xs text-ink-muted">
                          {paidToday.includes(charge.monthsAgo)
                            ? "Pagado hoy"
                            : `Pagado el día ${charge.paidDay}`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="crm-btn crm-btn-sm crm-btn-secondary"
                          aria-label={`Marcar como pagado el cobro de ${period}`}
                          disabled={disabled}
                          onClick={() => onMarkPaid(charge)}
                        >
                          Marcar pagado
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
