"use client";

import { ChevronDownIcon } from "@/components/icons";
import { TONE_CLASSES, type Tone } from "@/components/tone";
import {
  TICKET_STATUSES,
  TICKET_STATUS_TONES,
} from "@/features/tickets/constants";
import type { TicketStatus } from "@/features/tickets/types/ticket";

const BORDER_CLASSES: Partial<Record<Tone, string>> = {
  orange: "border-tone-orange-line",
  blue: "border-tone-blue-line",
  amber: "border-tone-amber-line",
  gray: "border-tone-gray-line",
};

/** El `select` mide 44 px y queda transparente sobre la etiqueta de 32 px. */
export function TicketStatusSelect({
  code,
  status,
  onChange,
}: {
  code: string;
  status: TicketStatus;
  onChange: (status: TicketStatus) => void;
}) {
  const tone = TICKET_STATUS_TONES[status];

  return (
    <span className="relative inline-flex h-11 items-center rounded-full has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-ink">
      <span
        aria-hidden="true"
        className={`crm-badge h-8 gap-2 border pr-2.5 pl-3 ${TONE_CLASSES[tone]} ${BORDER_CLASSES[tone]}`}
      >
        {status}
        <ChevronDownIcon size={10} />
      </span>
      <select
        aria-label={`Estado de ${code}`}
        value={status}
        onChange={(event) => onChange(event.target.value as TicketStatus)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {TICKET_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </span>
  );
}
