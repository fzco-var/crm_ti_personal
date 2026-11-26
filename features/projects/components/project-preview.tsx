"use client";

import { useId, type ReactNode } from "react";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectTimeline } from "@/features/projects/components/project-timeline";
import type { ProjectFormValues } from "@/features/projects/types/project";
import {
  findProjectClient,
  getDurationDays,
  getPreviewEndText,
} from "@/features/projects/utils";
import { formatDate } from "@/features/tickets/utils";

/** Vista previa del alta; la línea de tiempo aparece con fechas válidas. */
export function ProjectPreview({
  code,
  values,
  today,
}: {
  code: string;
  values: ProjectFormValues;
  today: string;
}) {
  const headingId = useId();
  const client = findProjectClient(values.clientId);
  const duration = getDurationDays(values.startDate, values.endDate);

  return (
    <aside
      aria-labelledby={headingId}
      className="crm-card min-w-0 flex-[1_1_280px] gap-[18px] p-6"
    >
      <h2 id={headingId} className="text-base font-bold">
        Vista previa
      </h2>
      <div className="flex flex-col gap-1">
        <span className="text-base leading-[1.3] font-bold">
          {values.name.trim() || "Nombre del proyecto"}
        </span>
        <span className="font-mono text-xs text-ink-muted">{code}</span>
      </div>
      <dl className="flex flex-col gap-3 text-compact">
        <PreviewItem label="Cliente">
          <span className="font-semibold">
            {client ? `${client.firstName} ${client.lastName}` : "—"}
          </span>
          {client && (
            <span className="block text-ink-muted">{client.company}</span>
          )}
        </PreviewItem>
        <PreviewItem label="Estado" className="items-center">
          <ProjectStatusBadge status={values.status} />
        </PreviewItem>
        <PreviewItem label="Fecha de término">
          <span className="font-mono">
            {values.endDate ? formatDate(values.endDate) : "—"}
          </span>
          {values.endDate && (
            <span className="block text-ink-muted">
              {getPreviewEndText(values.endDate, today)}
            </span>
          )}
        </PreviewItem>
      </dl>

      {duration !== null && duration >= 0 && (
        <div className="flex flex-col gap-2 border-t border-line-soft pt-4">
          <span className="text-compact font-bold">Línea de tiempo</span>
          <ProjectTimeline
            startDate={values.startDate}
            endDate={values.endDate}
            today={today}
            milestones={values.milestones}
            variant="preview"
          />
        </div>
      )}
    </aside>
  );
}

function PreviewItem({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
