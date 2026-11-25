import type { Metadata } from "next";
import { Suspense } from "react";
import { clients } from "@/data/clients";
import { TicketCreateForm } from "@/features/tickets/components/ticket-create-form";

export const metadata: Metadata = { title: "Nuevo ticket" };

/** `searchParams` va dentro de `Suspense`: la página sigue teniendo una parte estática. */
export default function NewTicketPage({
  searchParams,
}: PageProps<"/tickets/new">) {
  return (
    <Suspense fallback={<TicketCreateForm />}>
      <CreateFormForClient searchParams={searchParams} />
    </Suspense>
  );
}

/** Un `client` ausente o desconocido deja el alta normal. */
async function CreateFormForClient({
  searchParams,
}: Pick<PageProps<"/tickets/new">, "searchParams">) {
  const { client } = await searchParams;
  const clientId =
    typeof client === "string" && clients.some(({ id }) => id === client)
      ? client
      : undefined;

  return <TicketCreateForm clientId={clientId} />;
}
