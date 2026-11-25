import { clients } from "@/data/clients";
import { PHONE_PREFIXES } from "@/features/clients/constants";
import type { Client, ClientFormValues } from "@/features/clients/types/client";

export type Company = Pick<Client, "street" | "unit" | "city" | "region"> & {
  name: string;
  contactCount: number;
};

/** Minúsculas, sin tildes ni espacios en los extremos. */
export function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
}

export function getInitials(firstName: string, lastName: string) {
  const initials = firstName.trim().charAt(0) + lastName.trim().charAt(0);
  return initials.toUpperCase() || "··";
}

/** Iniciales de las dos primeras palabras de más de dos letras. */
export function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function getPhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function getPhonePrefix(value: string) {
  return (
    PHONE_PREFIXES.find((prefix) => prefix.value === value) ?? PHONE_PREFIXES[0]
  );
}

export function isValidPhone(prefix: string, phone: string) {
  return getPhoneDigits(phone).length === getPhonePrefix(prefix).digits;
}

export function formatPhone(prefix: string, phone: string) {
  const digits = getPhoneDigits(phone);
  if (prefix !== "+56" || digits.length !== 9) return `${prefix} ${digits}`;

  // Móviles (9) y Santiago (2): 1 + 4 + 4; otros fijos: 2 + 3 + 4.
  return /^[92]/.test(digits)
    ? `${prefix} ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`
    : `${prefix} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Campos obligatorios vacíos o con un formato no válido. */
export function getInvalidFields(values: ClientFormValues) {
  const isValid = {
    firstName: Boolean(values.firstName.trim()),
    lastName: Boolean(values.lastName.trim()),
    company: Boolean(values.company.trim()),
    phone: isValidPhone(values.phonePrefix, values.phone),
    email: isValidEmail(values.email),
    street: Boolean(values.street.trim()),
    city: Boolean(values.city.trim()),
    region: Boolean(values.region),
    role: Boolean(values.role),
  };
  return (Object.keys(isValid) as (keyof typeof isValid)[]).filter(
    (field) => !isValid[field],
  );
}

export function getPhoneLengthError(prefix: string, phone: string) {
  const { label, digits } = getPhonePrefix(prefix);
  return `Para ${label} el número debe tener ${digits} dígitos (tiene ${getPhoneDigits(phone).length}).`;
}

/** `excludeId` evita que el correo del propio cliente cuente como duplicado. */
export function findClientByEmail(email: string, excludeId?: string) {
  const query = normalizeText(email);
  return clients.find(
    (client) =>
      client.id !== excludeId && normalizeText(client.email) === query,
  );
}

export function findClientById(id: string) {
  return clients.find((client) => client.id === id);
}

/** Empresas según los clientes; la dirección es la del primer contacto. */
export function getCompanies() {
  const companies = new Map<string, Company>();
  for (const { company: name, street, unit, city, region } of clients) {
    const company = companies.get(name);
    if (company) company.contactCount += 1;
    else {
      companies.set(name, {
        name,
        contactCount: 1,
        street,
        unit,
        city,
        region,
      });
    }
  }
  return [...companies.values()];
}

export function findCompany(name: string) {
  const query = normalizeText(name);
  return getCompanies().find(
    (company) => normalizeText(company.name) === query,
  );
}

/** Hasta 5 empresas que contienen el texto; ninguna si ya coincide con una. */
export function suggestCompanies(name: string) {
  const query = normalizeText(name);
  if (!query || findCompany(name)) return [];
  return getCompanies()
    .filter((company) => normalizeText(company.name).includes(query))
    .slice(0, 5);
}

export function formatContactCount(count: number) {
  return count === 1 ? "1 contacto" : `${count} contactos`;
}

export function getOtherContacts(client: Client) {
  return clients.filter(
    (other) => other.id !== client.id && other.company === client.company,
  );
}
