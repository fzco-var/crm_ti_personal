import { tickets } from "@/data/tickets";
import type {
  Ticket,
  TicketFormValues,
  TicketStatus,
} from "@/features/tickets/types/ticket";
import { normalizeText } from "@/lib/text";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_TITLE_LENGTH = 6;
const MIN_RESOLUTION_LENGTH = 10;

export function findTicketById(id: string) {
  return tickets.find((ticket) => ticket.id === id);
}

export function getTicketsByRequester(clientId: string) {
  return tickets.filter(({ requesterId }) => requesterId === clientId);
}

export function getTicketsByProject(projectId: string) {
  return tickets.filter((ticket) => ticket.projectId === projectId);
}

export function formatDays(days: number) {
  return days === 1 ? "1 día" : `${days} días`;
}

function formatHours(hours: number) {
  return hours === 1 ? "1 hora" : `${hours} horas`;
}

/** Redondea a días desde las 24 horas. */
export function formatHoursAgo(hours: number) {
  if (hours < 1) return "recién";
  return `hace ${hours < 24 ? formatHours(hours) : formatDays(Math.round(hours / 24))}`;
}

/** Días y horas, sin las partes en cero: "1 día y 2 horas". */
export function formatDuration(totalHours: number) {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days === 0) return formatHours(hours);
  if (hours === 0) return formatDays(days);
  return `${formatDays(days)} y ${formatHours(hours)}`;
}

/*
 * Las fechas son textos "2026-11-26", que se comparan con < y >. Los cálculos
 * usan UTC para que el cambio de hora no altere la cantidad de días.
 */

export function addDays(date: string, days: number) {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** "26 nov 2026" */
export function formatDate(date: string) {
  return new Date(date)
    .toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .replaceAll(".", "")
    .replaceAll("-", " ");
}

export function getDueText(
  dueDate: string,
  status: TicketStatus,
  today: string,
) {
  if (!dueDate) return "Sin fecha límite.";
  if (status === "Cerrado") return formatDate(dueDate);

  const days = getDaysUntil(dueDate, today);
  if (days < 0) return `Vencida hace ${formatDays(-days)}`;
  if (days === 0) return "Vence hoy";
  return days === 1 ? "Vence mañana" : `Vence en ${formatDays(days)}`;
}

export function getDaysUntil(date: string, today: string) {
  return Math.round((Date.parse(date) - Date.parse(today)) / DAY_MS);
}

export function isValidTitle(title: string) {
  return title.trim().length >= MIN_TITLE_LENGTH;
}

/** `today` es nula durante el prerender. */
export function isPastDate(date: string, today: string | null) {
  return Boolean(date && today && date < today);
}

/** Cerrar exige una resolución; un ticket ya cerrado no la pide. */
export function isMissingResolution(
  { status, resolution }: Pick<TicketFormValues, "status" | "resolution">,
  savedStatus: TicketStatus,
) {
  return (
    status === "Cerrado" &&
    savedStatus !== "Cerrado" &&
    resolution.trim().length < MIN_RESOLUTION_LENGTH
  );
}

function getWords(text: string) {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Mismo proyecto y mismo nombre, o dos palabras en común de más de 3 letras. */
export function findDuplicateTicket(
  title: string,
  projectId: string,
): Ticket | undefined {
  const words = getWords(title);
  const keywords = words.filter((word) => word.length > 3);
  if (keywords.length === 0) return undefined;

  return getTicketsByProject(projectId).find((ticket) => {
    const ticketWords = getWords(ticket.title);
    if (ticketWords.join(" ") === words.join(" ")) return true;

    const ticketKeywords = ticketWords.filter((word) => word.length > 3);
    const shared = keywords.filter((word) => ticketKeywords.includes(word));
    return shared.length >= Math.min(2, ticketKeywords.length);
  });
}
