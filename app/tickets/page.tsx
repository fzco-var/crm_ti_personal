import type { Metadata } from "next";
import { Suspense } from "react";
import { projects } from "@/data/projects";
import { tickets } from "@/data/tickets";
import { TicketsList } from "@/features/tickets/components/tickets-list";

export const metadata: Metadata = { title: "Tickets" };

/** `searchParams` va dentro de `Suspense`: la página sigue teniendo una parte estática. */
export default function TicketsPage({ searchParams }: PageProps<"/tickets">) {
  return (
    <Suspense fallback={<TicketsList tickets={tickets} />}>
      <ListForProject searchParams={searchParams} />
    </Suspense>
  );
}

/**
 * Un `project` ausente o desconocido deja el listado normal. El proyecto es
 * la `key`: otro parámetro reinicia el estado conservado del listado.
 */
async function ListForProject({
  searchParams,
}: Pick<PageProps<"/tickets">, "searchParams">) {
  const { project } = await searchParams;
  const projectId =
    typeof project === "string" && projects.some(({ id }) => id === project)
      ? project
      : undefined;

  return (
    <TicketsList
      key={projectId ?? ""}
      tickets={tickets}
      projectId={projectId}
    />
  );
}
