import type { MilestoneFormValues } from "@/features/projects/types/project";
import { getTimelinePercent } from "@/features/projects/utils";
import { formatDate } from "@/features/tickets/utils";

/**
 * Del inicio al término, con la barra hasta hoy y un rombo por hito con
 * fecha. El dibujo es decorativo: las fechas y la leyenda se leen como texto.
 * En `progress` (panel "Avance"), los hitos hechos van en verde.
 */
export function ProjectTimeline({
  startDate,
  endDate,
  today,
  milestones,
  variant,
}: {
  startDate: string;
  endDate: string;
  today: string;
  milestones: Pick<MilestoneFormValues, "date" | "done">[];
  variant: "preview" | "progress";
}) {
  const dated = milestones.filter(({ date }) => date);
  const todayPercent = getTimelinePercent(today, startDate, endDate);

  let legend = "● inicio · ○ término";
  if (variant === "progress") legend = "◆ verde: hito hecho · ◇ pendiente";
  else if (dated.length > 0) legend = "● inicio · ◆ hitos · ○ término";

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden="true" className="relative h-7">
        <span className="absolute inset-x-0 top-3 h-1 rounded-full bg-line-soft" />
        <span
          className="absolute top-3 left-0 h-1 rounded-full bg-accent"
          style={{ width: `${todayPercent}%` }}
        />
        <span className="absolute top-2 left-0 -ml-0.5 size-3 rounded-full bg-ink" />
        <span className="absolute top-2 right-0 -mr-0.5 size-3 rounded-full border-2 border-ink bg-surface" />
        {dated.map(({ date, done }, index) => (
          <span
            key={index}
            className={`absolute top-[7px] -ml-[7px] size-3.5 rotate-45 border-2 ${markerClasses(variant, done)}`}
            style={{
              left: `${getTimelinePercent(date, startDate, endDate)}%`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between gap-2 font-mono text-[11px] text-ink-muted">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>
      <span className="text-xs text-ink-muted">{legend}</span>
    </div>
  );
}

function markerClasses(variant: "preview" | "progress", done: boolean) {
  if (variant === "preview") return "border-accent bg-surface";
  return done
    ? "border-tone-green-dot bg-tone-green-dot"
    : "border-ink-soft bg-surface";
}
