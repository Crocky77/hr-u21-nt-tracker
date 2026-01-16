// utils/privacy.js

// Vrati sigurnu oznaku usera bez emaila.
// Ako postoji nick/username -> koristi to.
// Ako ne postoji -> maskiraj email u obliku a***@d***.com
export function safeUserLabel(user) {
  const meta = user?.user_metadata || {};
  const nick =
    meta.nickname ||
    meta.nick ||
    meta.username ||
    meta.name ||
    meta.full_name ||
    null;

  if (nick && String(nick).trim().length > 0) return String(nick).trim();

  const email = user?.email || "";
  return maskEmail(email) || "Korisnik";
}

export function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  const parts = email.split("@");
  if (parts.length !== 2) return "";
  const [local, domain] = parts;
  const safeLocal = local.length <= 1 ? "*" : local[0] + "***";
  const dParts = domain.split(".");
  const d0 = dParts[0] || "";
  const safeDomain = d0.length <= 1 ? "*" : d0[0] + "***";
  const tld = dParts.slice(1).join(".");
  return `${safeLocal}@${safeDomain}${tld ? "." + tld : ""}`;
}

// Jednostavna detekcija “opasnih stringova” (emailovi, anon key pattern).
export function detectSensitiveText(text) {
  if (!text || typeof text !== "string") return [];
  const hits = [];

  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const emails = text.match(emailRegex);
  if (emails?.length) hits.push(...emails.map((e) => `EMAIL:${e}`));

  // Supabase anon key često počinje s "eyJ" (JWT). Ovo je heuristika.
  const jwtLike = /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
  const jwts = text.match(jwtLike);
  if (jwts?.length) hits.push(...jwts.map((t) => `JWT:${t.slice(0, 12)}...`));

  return hits;
}
