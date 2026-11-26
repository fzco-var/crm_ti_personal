import { clients } from "@/data/clients";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import {
  LOW_MARGIN_RATIO,
  OWN_PROVIDER,
  RENEWAL_SOON_DAYS,
  RENEWAL_UPCOMING_DAYS,
  SERVICE_RENEWAL_DAYS,
  SERVICE_STATUSES,
} from "@/features/services/constants";
import type {
  Service,
  ServiceCharge,
  ServiceFormValues,
  ServicePeriod,
  ServiceStatus,
} from "@/features/services/types/service";
import {
  addMonths,
  findProjectById,
  findProjectClient,
  getClientName,
  getProjectCompany,
} from "@/features/projects/utils";
import { addDays, formatDays, isPastDate } from "@/features/tickets/utils";
import { normalizeText } from "@/lib/text";

/*
 * Las fechas son textos "2026-11-26", como en tickets y proyectos. Los montos
 * mensuales se suman sin redondear y solo se redondean al formatear.
 */

export function findServiceById(id: string) {
  return services.find((service) => service.id === id);
}

// Montos

const CLP_FORMAT = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
const THOUSANDS_FORMAT = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

/** "$35.000" */
export function formatCLP(amount: number) {
  return CLP_FORMAT.format(Math.round(amount));
}

/** "+$5.000" o "−$35.000"; el signo menos es tipográfico. */
export function formatCLPDelta(amount: number) {
  const rounded = Math.round(amount);
  return `${rounded < 0 ? "−" : "+"}${formatCLP(Math.abs(rounded))}`;
}

/** "35.000" para el campo de monto; vacío si es 0. */
export function formatThousands(amount: number) {
  return amount ? THOUSANDS_FORMAT.format(amount) : "";
}

/** Solo los dígitos del texto; 0 si no hay ninguno. */
export function parseMoney(text: string) {
  return Number.parseInt(text.replace(/\D/g, ""), 10) || 0;
}

/** El monto si es mensual, o 1/12 si es anual. */
export function toMonthly(amount: number, period: ServicePeriod) {
  return period === "año" ? amount / 12 : amount;
}

export function getMargin(charge: number, cost: number) {
  return charge - cost;
}

/** Porcentaje del cobro, redondeado; 0 si no hay cobro. */
export function getMarginPercent(charge: number, cost: number) {
  return charge ? Math.round((getMargin(charge, cost) / charge) * 100) : 0;
}

export function isLowMargin(charge: number, cost: number) {
  return charge > 0 && getMargin(charge, cost) < charge * LOW_MARGIN_RATIO;
}

/** Variación del cobro: "+14%", "0%" o "-20%". */
export function formatPercentDelta(before: number, after: number) {
  const percent = before ? Math.round(((after - before) / before) * 100) : 0;
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

// Ingreso recurrente

function isActive({ status }: Pick<Service, "status">) {
  return status === "Activo";
}

/** Lo que el servicio suma al ingreso mensual: nada si no está activo. */
export function getMonthlyContribution({
  status,
  charge,
  period,
}: Pick<Service, "status" | "charge" | "period">) {
  return status === "Activo" ? toMonthly(charge, period) : 0;
}

export function getMonthlyRevenue(list: Service[]) {
  return list.reduce(
    (sum, service) => sum + getMonthlyContribution(service),
    0,
  );
}

export function getMonthlyCost(list: Service[]) {
  return list
    .filter(isActive)
    .reduce((sum, { cost, period }) => sum + toMonthly(cost, period), 0);
}

// Renovaciones

export function isRenewalOverdue({ status, renewInDays }: Service) {
  return status === "Activo" && renewInDays < 0;
}

export function isRenewalSoon({ status, renewInDays }: Service) {
  return (
    status === "Activo" && renewInDays >= 0 && renewInDays <= RENEWAL_SOON_DAYS
  );
}

/** Activos que renuevan entre hoy y 30 días, por fecha ascendente. */
export function getUpcomingRenewals(list: Service[]) {
  return list
    .filter(
      (service) =>
        isActive(service) &&
        service.renewInDays >= 0 &&
        service.renewInDays <= RENEWAL_UPCOMING_DAYS,
    )
    .sort((a, b) => a.renewInDays - b.renewInDays);
}

/** "Cancelado", "Pausado, no se cobra", "Venció hace 3 días", "Renueva hoy" o "En 4 días". */
export function getRenewalText({ status, renewInDays }: Service) {
  if (status === "Cancelado") return "Cancelado";
  if (status === "En pausa") return "Pausado, no se cobra";
  if (renewInDays < 0) return `Venció hace ${formatDays(-renewInDays)}`;
  if (renewInDays === 0) return "Renueva hoy";
  return `En ${formatDays(renewInDays)}`;
}

/** El servicio con la renovación corrida 30 o 365 días. */
export function renewService(service: Service): Service {
  return {
    ...service,
    renewInDays: service.renewInDays + SERVICE_RENEWAL_DAYS[service.period],
  };
}

// Indicadores

export function getServicesSummary(list: Service[]) {
  const revenue = getMonthlyRevenue(list);
  const cost = getMonthlyCost(list);
  const active = list.filter(isActive);
  const upcoming = getUpcomingRenewals(list);
  return {
    revenue,
    cost,
    margin: revenue - cost,
    marginPercent: revenue ? Math.round(((revenue - cost) / revenue) * 100) : 0,
    activeCount: active.length,
    companyCount: new Set(active.map(getServiceCompany)).size,
    upcomingCount: upcoming.length,
    manualUpcomingCount: upcoming.filter(({ autoRenew }) => !autoRenew).length,
  };
}

// Clientes y proyectos

/** La empresa del servicio es la de su contacto. */
export function getServiceCompany({ clientId }: Pick<Service, "clientId">) {
  return getProjectCompany({ clientId });
}

export function findServiceClient({ clientId }: Pick<Service, "clientId">) {
  return findProjectClient(clientId);
}

/** Proyectos de los contactos de la empresa, en el orden de `data/projects`. */
export function getCompanyProjects(clientId: string) {
  const company = getServiceCompany({ clientId });
  if (!company) return [];
  const contactIds = clients
    .filter((client) => client.company === company)
    .map(({ id }) => id);
  return projects.filter((project) => contactIds.includes(project.clientId));
}

export function getServiceProject({ projectId }: Pick<Service, "projectId">) {
  return projectId ? findProjectById(projectId) : undefined;
}

/** Empresas con servicios, en orden alfabético. */
export function getServiceCompanies(list: Service[]) {
  return [...new Set(list.map(getServiceCompany))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));
}

/** Servicios no cancelados de la misma empresa, sin el propio. */
export function getOtherServices(service: Pick<Service, "id" | "clientId">) {
  const company = getServiceCompany(service);
  return services.filter(
    (other) =>
      other.id !== service.id &&
      other.status !== "Cancelado" &&
      getServiceCompany(other) === company,
  );
}

// Listado

export type ServiceSortKey =
  "name" | "company" | "charge" | "renewal" | "status";

export interface ServicesSort {
  key: ServiceSortKey;
  direction: "ascending" | "descending";
}

function getStatusOrder(status: ServiceStatus) {
  return SERVICE_STATUSES.indexOf(status);
}

/** Nombre, proveedor, contacto, empresa y código de proyecto, sin mayúsculas ni tildes. */
export function matchesServiceSearch(service: Service, query: string) {
  const text = normalizeText(query);
  if (!text) return true;
  return normalizeText(
    [
      service.name,
      service.provider,
      getClientName(service.clientId),
      getServiceCompany(service),
      getServiceProject(service)?.code ?? "",
    ].join(" "),
  ).includes(text);
}

export function sortServices(
  list: Service[],
  { key, direction }: ServicesSort,
) {
  const compare: Record<ServiceSortKey, (a: Service, b: Service) => number> = {
    name: (a, b) => a.name.localeCompare(b.name, "es"),
    company: (a, b) =>
      getServiceCompany(a).localeCompare(getServiceCompany(b), "es"),
    charge: (a, b) =>
      toMonthly(a.charge, a.period) - toMonthly(b.charge, b.period),
    renewal: (a, b) =>
      getStatusOrder(a.status) - getStatusOrder(b.status) ||
      a.renewInDays - b.renewInDays,
    status: (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status),
  };
  const sign = direction === "ascending" ? 1 : -1;
  return [...list].sort((a, b) => compare[key](a, b) * sign);
}

// Fechas

/** "nov 2026" */
export function formatMonth(date: string) {
  const month = new Date(date)
    .toLocaleDateString("es-CL", { month: "short", timeZone: "UTC" })
    .replaceAll(".", "");
  return `${month} ${date.slice(0, 4)}`;
}

/** Primer día del mes `monthsAgo` meses antes de hoy. */
function getMonthStart(today: string, monthsAgo: number) {
  return addMonths(`${today.slice(0, 7)}-01`, -monthsAgo);
}

/** Periodo de un cobro: "nov 2026". */
export function getChargePeriod(today: string, monthsAgo: number) {
  return formatMonth(getMonthStart(today, monthsAgo));
}

/** "desde abr 2026" */
export function getSinceText(today: string, createdDaysAgo: number) {
  return `desde ${formatMonth(addDays(today, -createdDaysAgo))}`;
}

// Cobros

export function getChargesSummary(charges: ServiceCharge[]) {
  const paid = charges.filter(({ paidDay }) => paidDay !== null);
  const pending = charges.filter(({ paidDay }) => paidDay === null);
  const collected = paid.reduce((sum, { amount }) => sum + amount, 0);
  // Al proveedor se le paga cada periodo, aunque el cliente no haya pagado.
  const providerCost = charges.reduce((sum, { cost }) => sum + cost, 0);
  return {
    collected,
    providerCost,
    profit: collected - providerCost,
    pendingCount: pending.length,
    pendingAmount: pending.reduce((sum, { amount }) => sum + amount, 0),
  };
}

// Validación

export type ServiceField =
  "name" | "provider" | "clientId" | "charge" | "renewDate";

/** `today` es nula durante el prerender. */
export function isPastRenewal(renewDate: string, today: string | null) {
  return isPastDate(renewDate, today);
}

/** Alta: nombre, proveedor, cliente, cobro y renovación desde hoy. */
export function getInvalidCreateFields(
  values: ServiceFormValues,
  today: string | null,
) {
  const isValid: Record<ServiceField, boolean> = {
    name: Boolean(values.name.trim()),
    provider: Boolean(getFormProvider(values).trim()),
    clientId: Boolean(values.clientId),
    charge: values.charge > 0,
    renewDate:
      Boolean(values.renewDate) && !isPastRenewal(values.renewDate, today),
  };
  return (Object.keys(isValid) as ServiceField[]).filter(
    (field) => !isValid[field],
  );
}

/** Edición: solo nombre y cobro. */
export function getInvalidEditFields(values: ServiceFormValues) {
  const invalid: ServiceField[] = [];
  if (!values.name.trim()) invalid.push("name");
  if (values.charge <= 0) invalid.push("charge");
  return invalid;
}

/** `password:`, `contraseña=`, `token:`, `secret:`, `api_key:`… */
const SECRET_PATTERN =
  /(pass(word)?|contrase(ñ|n)a|token|secret|api[_ -]?key)\s*[:=]/i;

export function looksLikeSecret(notes: string) {
  return SECRET_PATTERN.test(notes);
}

// Formularios

/** En Mantención el proveedor es siempre "Tú". */
export function getFormProvider({
  type,
  provider,
}: Pick<ServiceFormValues, "type" | "provider">) {
  return type === "Mantención" ? OWN_PROVIDER : provider;
}

/** Valores iniciales del alta; cliente y proyecto se pueden conservar. */
export function getNewServiceValues(
  today: string,
  keep: Pick<ServiceFormValues, "clientId" | "projectId"> = {
    clientId: "",
    projectId: "",
  },
): ServiceFormValues {
  return {
    name: "",
    type: "Hosting e infraestructura",
    provider: "",
    clientId: keep.clientId,
    projectId: keep.projectId,
    period: "mes",
    charge: 0,
    cost: 0,
    renewDate: addMonths(today, 1),
    noticeDays: 7,
    autoRenew: true,
    status: "Activo",
    notes: "",
    endDate: "",
    cancelReason: "",
  };
}

/** Valores de edición de un servicio guardado; `today` fija los desfases. */
export function toServiceFormValues(
  service: Service,
  today: string,
): ServiceFormValues {
  const renewDate = addDays(today, service.renewInDays);
  return {
    name: service.name,
    type: service.type,
    provider: service.provider,
    clientId: service.clientId,
    projectId: service.projectId ?? "",
    period: service.period,
    charge: service.charge,
    cost: service.cost,
    renewDate,
    noticeDays: service.noticeDays,
    autoRenew: service.autoRenew,
    status: service.status,
    notes: service.notes,
    endDate:
      service.endInDays === null
        ? renewDate
        : addDays(today, service.endInDays),
    cancelReason: service.cancelReason,
  };
}
