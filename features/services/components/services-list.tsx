"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useState } from "react";
import { Alert } from "@/components/alert";
import { Breadcrumb } from "@/components/breadcrumb";
import { PlusIcon, SearchIcon, ServicesIcon } from "@/components/icons";
import { useToday } from "@/components/use-today";
import { ServicesSummary } from "@/features/services/components/services-summary";
import { ServicesTable } from "@/features/services/components/services-table";
import { UpcomingRenewals } from "@/features/services/components/upcoming-renewals";
import { SERVICE_TYPES } from "@/features/services/constants";
import type { Service, ServiceType } from "@/features/services/types/service";
import {
  type ServicesSort,
  getServiceCompanies,
  getServiceCompany,
  matchesServiceSearch,
  renewService,
} from "@/features/services/utils";
import { addDays, formatDate } from "@/features/tickets/utils";

type TypeTab = ServiceType | "Todos";

const TYPE_TABS: TypeTab[] = [
  "Todos",
  ...SERVICE_TYPES.map(({ value }) => value),
];

/** Activity conserva filtros, orden y renovaciones al volver al listado. */
export function ServicesList({ services }: { services: Service[] }) {
  const today = useToday();
  const searchId = useId();
  const companyId = useId();
  const cancelledId = useId();
  const [list, setList] = useState(services);
  // "Deshacer" solo vuelve atrás el último cambio.
  const [undoList, setUndoList] = useState<Service[] | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeTab, setTypeTab] = useState<TypeTab>("Todos");
  const [company, setCompany] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [sort, setSort] = useState<ServicesSort>({
    key: "renewal",
    direction: "ascending",
  });

  // Al salir, Activity conserva el estado; el aviso es lo único que se cierra.
  useLayoutEffect(() => () => closeNotice(), []);

  if (!today) {
    return (
      <div className="crm-content">
        <p role="status" className="text-sm text-ink-muted">
          Cargando servicios…
        </p>
      </div>
    );
  }

  const shownServices = list.filter(
    ({ status }) => showCancelled || status !== "Cancelado",
  );
  const visibleServices = shownServices.filter(
    (service) =>
      (typeTab === "Todos" || service.type === typeTab) &&
      (!company || getServiceCompany(service) === company) &&
      matchesServiceSearch(service, search),
  );

  function closeNotice() {
    setNotice("");
    setUndoList(null);
  }

  const currentDay = today;

  function renew(service: Service) {
    const renewed = renewService(service);
    setUndoList(list);
    setList(list.map((other) => (other.id === service.id ? renewed : other)));
    setNotice(
      `Renovación registrada: «${service.name}» hasta el ${formatDate(
        addDays(currentDay, renewed.renewInDays),
      )}.`,
    );
  }

  function undo() {
    if (!undoList) return;
    setList(undoList);
    setUndoList(null);
    setNotice("Cambio deshecho.");
  }

  return (
    <div className="crm-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[{ label: "Operación" }, { label: "Servicios" }]}
          />
          <h1 className="crm-title">Servicios</h1>
          <p className="text-sm text-ink-muted">
            Lo que cobras de forma recurrente y lo que pagas por cada cliente,
            con sus renovaciones.
          </p>
        </div>
        <Link href="/services/new" className="crm-btn crm-btn-primary">
          <PlusIcon />
          Nuevo servicio
        </Link>
      </div>

      <ServicesSummary services={list} />

      {notice && (
        <Alert
          variant="success"
          onClose={closeNotice}
          action={
            undoList && (
              <button
                type="button"
                className="crm-btn crm-btn-sm crm-btn-secondary border-tone-green-line text-tone-green-fg"
                onClick={undo}
              >
                Deshacer
              </button>
            )
          }
        >
          {notice}
        </Alert>
      )}

      <UpcomingRenewals services={list} onRenew={renew} />

      <section
        aria-label="Listado de servicios"
        className="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
      >
        <div role="tablist" aria-label="Tipo de servicio" className="crm-tabs">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className="crm-tab"
              aria-selected={tab === typeTab}
              onClick={() => setTypeTab(tab)}
            >
              {tab}
              <span className="rounded-full bg-canvas px-1.5 py-px font-mono text-xs font-medium text-ink-soft">
                {tab === "Todos"
                  ? shownServices.length
                  : shownServices.filter(({ type }) => type === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-5 py-3.5">
          <div className="relative flex max-w-[380px] flex-[1_1_260px]">
            <SearchIcon className="pointer-events-none absolute top-[13px] left-3.5 text-ink-muted" />
            <label htmlFor={searchId} className="sr-only">
              Buscar servicios
            </label>
            <input
              id={searchId}
              type="search"
              className="crm-field crm-field-sm pl-[42px]"
              placeholder="Buscar por servicio, proveedor o cliente"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-[0_1_240px] flex-col">
            <label htmlFor={companyId} className="sr-only">
              Filtrar por cliente
            </label>
            <select
              id={companyId}
              className="crm-field crm-field-sm px-3"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            >
              <option value="">Todos los clientes</option>
              {getServiceCompanies(list).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor={cancelledId} className="font-semibold text-compact">
            <input
              id={cancelledId}
              type="checkbox"
              className="crm-checkbox"
              checked={showCancelled}
              onChange={(event) => setShowCancelled(event.target.checked)}
            />
            Mostrar cancelados
          </label>
        </div>

        {visibleServices.length > 0 ? (
          <ServicesTable
            services={visibleServices}
            sort={sort}
            today={today}
            onSortChange={setSort}
          />
        ) : (
          <EmptyState isEmpty={list.length === 0} />
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-line-soft px-5 py-3.5 text-compact text-ink-muted">
          <span>
            Mostrando {visibleServices.length} de {shownServices.length}{" "}
            servicios
          </span>
          <span>
            Montos en CLP. Los anuales se prorratean a mes en los indicadores.
          </span>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        <ServicesIcon size={22} />
      </span>
      <span className="text-base font-bold">
        {isEmpty ? "Aún no hay servicios" : "Sin resultados"}
      </span>
      <span className="max-w-[400px] text-sm leading-normal text-ink-muted">
        {isEmpty
          ? "Registra mantenciones, hosting, dominios o APIs que cobras a tus clientes para ver tu ingreso recurrente y no olvidar renovaciones."
          : "Ningún servicio coincide con la búsqueda o los filtros."}
      </span>
    </div>
  );
}
