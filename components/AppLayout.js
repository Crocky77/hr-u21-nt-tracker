/**
 * utils/privacy.js
 *
 * Centralni privacy guard za cijelu aplikaciju.
 * Cilj:
 *  - nikad ne prikazivati email, nick, userId, raw session podatke
 *  - maskirati sve osjetljivo u UI-ju i logovima
 *  - imati jedno mjesto kontrole
 */

/* ===========================
   REGEX DEFINICIJE
=========================== */

const EMAIL_REGEX =
  /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

/* ===========================
   MASKIRANJE STRINGOVA
=========================== */

/**
 * Maskira email adresu
 * primjer:
 *   john.doe@gmail.com -> j***@gmail.com
 */
export function maskEmail(email) {
  if (!email || typeof email !== "string") return "";

  const [user, domain] = email.split("@");
  if (!user || !domain) return "";

  return `${user.charAt(0)}***@${domain}`;
}

/**
 * Maskira generički string (nick, ime, id)
 * primjer:
 *   Crocky77 -> C*****7
 */
export function maskString(value) {
  if (!value || typeof value !== "string") return "";

  if (value.length <= 2) return "***";

  return (
    value.charAt(0) +
    "*".repeat(Math.max(3, value.length - 2)) +
    value.charAt(value.length - 1)
  );
}

/* ===========================
   DETEKCIJA OSJETLJIVIH PODATAKA
=========================== */

/**
 * Provjerava sadrži li string email
 */
export function containsEmail(text) {
  if (!text || typeof text !== "string") return false;
  return EMAIL_REGEX.test(text);
}

/**
 * Provjerava sadrži li UUID / session id
 */
export function containsUUID(text) {
  if (!text || typeof text !== "string") return false;
  return UUID_REGEX.test(text);
}

/* ===========================
   SANITIZACIJA OUTPUTA
=========================== */

/**
 * Sanitizira bilo koji tekst prije rendera u UI
 */
export function sanitizeText(text) {
  if (!text || typeof text !== "string") return text;

  let sanitized = text;

  sanitized = sanitized.replace(EMAIL_REGEX, (_, user, domain) => {
    return `${user.charAt(0)}***@${domain}`;
  });

  sanitized = sanitized.replace(UUID_REGEX, "***");

  return sanitized;
}

/* ===========================
   SAFE USER OBJECT
=========================== */

/**
 * Iz user objekta vraća samo SIGURNE podatke
 * NIKAD email, id, provider id
 */
export function getSafeUser(user) {
  if (!user) return null;

  return {
    role: user.role || "guest",
    displayName: user.displayName
      ? maskString(user.displayName)
      : "User",
    isAdmin: Boolean(user.isAdmin),
  };
}

/* ===========================
   SAFE LOGGING (OPTIONAL)
=========================== */

/**
 * Debug log koji automatski sanitizira output
 */
export function safeLog(...args) {
  if (process.env.NODE_ENV === "production") return;

  const safeArgs = args.map((arg) => {
    if (typeof arg === "string") return sanitizeText(arg);
    if (typeof arg === "object")
      return JSON.parse(
        JSON.stringify(arg, (_key, value) =>
          typeof value === "string" ? sanitizeText(value) : value
        )
      );
    return arg;
  });

  console.log("[SAFE LOG]", ...safeArgs);
}
