/** Minúsculas, sin tildes ni espacios en los extremos. */
export function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
}

export function getInitials(firstName: string, lastName: string) {
  const initials = firstName.trim().charAt(0) + lastName.trim().charAt(0);
  return initials.toUpperCase() || "··";
}
