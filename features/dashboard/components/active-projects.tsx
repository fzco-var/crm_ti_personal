"use client";

import Link from "next/link";
import { useId } from "react";
import type { getActiveProjects } from "@/features/dashboard/utils";

type ActiveProject = ReturnType<typeof getActiveProjects>[number];

const DEADLINE_CLASSES: Record<"danger" | "warning" | "none", string> = {
  danger: "font-bold text-danger",
  warning: "font-bold text-warning",
  none: "font-medium text-ink-muted",
};

const BAR_CLASSES: Record<ActiveProject["barTone"], string> = {
  danger: "bg-danger",
  paused: "bg-tone-gray-dot",
  default: "bg-ink",
};

export function ActiveProjects({ projects }: { projects: ActiveProject[] }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="crm-card gap-3.5 px-6 py-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={headingId} className="crm-heading">
          Proyectos activos
        </h2>
        <Link
          href="/projects"
          className="crm-link crm-hit text-compact font-bold"
        >
          Ver todos
        </Link>
      </div>

      <ul className="flex flex-col gap-1">
        {projects.map(
          ({
            project,
            company,
            deadline,
            barTone,
            doneMilestones,
            totalMilestones,
            progressPercent,
          }) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="-mx-2.5 flex flex-col gap-2 rounded-[10px] p-2.5 hover:bg-surface-hover"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="flex-none font-mono text-2xs text-ink-muted">
                      {project.code}
                    </span>
                    <span className="text-sm font-bold">{project.name}</span>
                  </span>
                  <span
                    className={`text-xs ${DEADLINE_CLASSES[deadline.tone ?? "none"]}`}
                  >
                    {deadline.text}
                  </span>
                </span>
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-1.5 flex-1 overflow-hidden rounded-[3px] bg-line-soft"
                  >
                    <span
                      className={`h-full rounded-[3px] ${BAR_CLASSES[barTone]}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </span>
                  <span className="min-w-[150px] flex-none text-xs text-ink-muted">
                    {doneMilestones}/{totalMilestones} hitos · {company}
                  </span>
                </span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
