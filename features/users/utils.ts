import { users } from "@/data/users";
import { findRoleById } from "@/features/roles/utils";
import { PASSWORD_MIN_LENGTH } from "@/features/users/constants";
import type { User, UserFormValues } from "@/features/users/types/user";
import { addDays, formatDate } from "@/features/tickets/utils";
import { normalizeText } from "@/lib/text";

export function findUserById(id: string) {
  return users.find((user) => user.id === id);
}

export function getFullName({
  firstName,
  lastName,
}: Pick<User, "firstName" | "lastName">) {
  return `${firstName} ${lastName}`;
}

// Roles

export function getUserRole({ roleId }: Pick<User, "roleId">) {
  return findRoleById(roleId);
}

export function countUsersByRole(list: User[], roleId: string) {
  return list.filter((user) => user.roleId === roleId).length;
}

// Listado

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "6 usuarios · 1 con contraseña temporal · 1 desactivado"; omite los 0. */
export function getUsersSummaryText(list: User[]) {
  if (list.length === 0) return "Todavía no hay usuarios.";
  const temporary = list.filter((user) => user.passwordTemporary).length;
  const inactive = list.filter((user) => !user.active).length;
  return [
    pluralize(list.length, "usuario", "usuarios"),
    temporary > 0 && `${temporary} con contraseña temporal`,
    inactive > 0 && pluralize(inactive, "desactivado", "desactivados"),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Nombre completo, usuario y email, sin mayúsculas ni tildes. */
export function matchesUserSearch(user: User, query: string) {
  const text = normalizeText(query);
  if (!text) return true;
  return normalizeText(
    [getFullName(user), user.username, user.email].join(" "),
  ).includes(text);
}

// Fechas

/** "hoy", "hace 12 días", "hace 3 semanas", "hace 2 meses" o "hace 1 año". */
export function formatPasswordAge(days: number) {
  if (days <= 0) return "hoy";
  if (days <= 13) return `hace ${pluralize(days, "día", "días")}`;
  if (days <= 29) {
    return `hace ${pluralize(Math.floor(days / 7), "semana", "semanas")}`;
  }
  if (days <= 364) {
    return `hace ${pluralize(Math.floor(days / 30), "mes", "meses")}`;
  }
  return `hace ${pluralize(Math.floor(days / 365), "año", "años")}`;
}

/** "hoy" con 0 días; si no, "27 nov 2026". */
export function formatDaysAgo(today: string, daysAgo: number) {
  return daysAgo === 0 ? "hoy" : formatDate(addDays(today, -daysAgo));
}

/** "hoy", "27 nov 2026" o "nunca". */
export function formatLastAccess(today: string, daysAgo: number | null) {
  return daysAgo === null ? "nunca" : formatDaysAgo(today, daysAgo);
}

// Validación

export type UserField = "firstName" | "lastName" | "username" | "email";
export type UserFieldError = "empty" | "invalid" | "taken";

const USERNAME_PATTERN = /^[a-z0-9._]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidUsername(username: string) {
  return USERNAME_PATTERN.test(username);
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email);
}

/** Otro usuario lo tiene, sin distinguir mayúsculas; `excludeId` es el propio. */
export function isUsernameTaken(username: string, excludeId?: string) {
  const text = username.toLowerCase();
  return users.some(
    (user) => user.id !== excludeId && user.username.toLowerCase() === text,
  );
}

export function isEmailTaken(email: string, excludeId?: string) {
  const text = email.toLowerCase();
  return users.some(
    (user) => user.id !== excludeId && user.email.toLowerCase() === text,
  );
}

/** Errores de los datos y la cuenta; el rol y la contraseña van aparte. */
export function getUserFieldErrors(
  values: UserFormValues,
  excludeId?: string,
): Partial<Record<UserField, UserFieldError>> {
  const errors: Partial<Record<UserField, UserFieldError>> = {};
  if (!values.firstName.trim()) errors.firstName = "empty";
  if (!values.lastName.trim()) errors.lastName = "empty";

  if (!values.username) errors.username = "empty";
  else if (!isValidUsername(values.username)) errors.username = "invalid";
  else if (isUsernameTaken(values.username, excludeId)) {
    errors.username = "taken";
  }

  if (!values.email) errors.email = "empty";
  else if (!isValidEmail(values.email)) errors.email = "invalid";
  else if (isEmailTaken(values.email, excludeId)) errors.email = "taken";

  return errors;
}

export function isValidPassword(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH;
}

// Usuario sugerido

function slugify(text: string) {
  return normalizeText(text).replace(/[^a-z0-9]/g, "");
}

/** Inicial del nombre más la primera palabra del apellido: "Pedro Núñez Soto" → "pnunez". */
export function suggestUsername(firstName: string, lastName: string) {
  const initial = slugify(firstName).charAt(0);
  const surname = slugify(lastName.trim().split(/\s+/)[0] ?? "");
  return initial + surname;
}

// Contraseñas

const PASSWORD_CLASSES = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];

/** De 0 (vacía) a 4 (fuerte), con las reglas de la plantilla. */
export function getPasswordStrength(password: string) {
  if (!password) return 0;
  const classes = PASSWORD_CLASSES.filter((pattern) =>
    pattern.test(password),
  ).length;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (classes >= 3) strength++;
  if (password.length >= 14 && classes === 4) strength++;
  return strength;
}

// Alfabeto de la plantilla, sin caracteres confundibles (I, l, O, 0, 1).
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*?";
const ALPHABET = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;
const GENERATED_LENGTH = 16;

function randomIndexes(count: number, max: number) {
  const values = crypto.getRandomValues(new Uint32Array(count));
  return Array.from(values, (value) => value % max);
}

/**
 * 16 caracteres con al menos una minúscula, una mayúscula, un dígito y un
 * símbolo; siempre "Fuerte". Solo se llama desde un manejador, nunca al renderizar.
 */
export function generatePassword() {
  const required = [LOWERCASE, UPPERCASE, DIGITS, SYMBOLS].map(
    (set) => set[randomIndexes(1, set.length)[0]],
  );
  const rest = randomIndexes(
    GENERATED_LENGTH - required.length,
    ALPHABET.length,
  ).map((index) => ALPHABET[index]);
  const chars = [...required, ...rest];
  // Fisher-Yates, para que las clases obligatorias no queden al principio.
  const swaps = crypto.getRandomValues(new Uint32Array(chars.length));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = swaps[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
