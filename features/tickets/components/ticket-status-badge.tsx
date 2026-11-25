import { TONE_CLASSES } from "@/components/tone";
import { TICKET_STATUS_TONES } from "@/features/tickets/constants";
import type { TicketStatus } from "@/features/tickets/types/ticket";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`crm-badge ${TONE_CLASSES[TICKET_STATUS_TONES[status]]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
