// utils/privacy.js
// Privacy guard helpers: maskiranje + siguran label za UI (bez emaila)

function isEmailLike(str) {
  if (!str) return false;
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(String(str));
}

export function maskEmail(email) {
  if (!email || typeof email !== "string") return "";
  const [user, domain] = email.split("@");
  if (!domain) return "hidden";
  const u = user || "";
  const maskedUser = u.length <= 2 ? `${u[0] || ""}*` : `${u[0]}***${u[u.length - 1]}`;
  const dParts = domain.split(".");
  const d0 = dParts[0] || "domain";
  const maskedDomain = d0.length <= 2 ? `${d0[0] || ""}*` : `${d0[0]}***${d0[d0.length - 1]}`;
  const tld = dParts.slice(1).join(".") || "tld";
  return `${maskedUser}@${maskedDomain}.${tld}`;
}

export function safeUserLabel(user) {
  // GOLDEN RULE: nikad ne prikazuj email u UI
  if (!user) return "Gost";

  // prefer nickname/display name
  const meta = user.user_metadata || {};
  const name =
    meta.nickname ||
    meta.username ||
    meta.name ||
    meta.full_name ||
    meta.display_name ||
    "";

  if (name && typeof name === "string") {
    // ako je tester ubacio email u name, maskiraj
    if (isEmailLike(name)) return "Korisnik";
    return name.trim();
  }

  // fallback: ID skraćeno
  const id = user.id || "";
  if (id && typeof id === "string") {
    const short = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6);
    return short ? `Korisnik#${short}` : "Korisnik";
  }

  // fallback bez emaila
  return "Korisnik";
}

export function detectPII(text) {
  const s = String(text || "");
  const matches = [];
  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  let m;
  while ((m = emailRe.exec(s))) {
    matches.push({ type: "email", value: m[0] });
  }
  return matches;
}

export function maskPII(text) {
  const s = String(text || "");
  return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[hidden-email]");
}
