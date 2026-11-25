import type { ClientFormValues } from "@/features/clients/types/client";

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>;

export interface ClientFieldsProps {
  values: ClientFormValues;
  errors: ClientFormErrors;
  onChange: (changes: Partial<ClientFormValues>) => void;
  /** Valores guardados. Solo en la edición: marca los cambios. */
  original?: ClientFormValues & { id: string };
}
