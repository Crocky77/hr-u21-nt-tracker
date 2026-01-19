// pages/api/transfers/[team].js

const TOXTTRICK_URL = "https://www.toxttrick.com/index.php?lang=en";

// “Croatia” se na Toxttrick često prikazuje kao “Hrvatska”
const CRO_TOKENS = ["Hrvatska", "Croatia"];

// Super jednostavan “HTML -> text” (dovoljno dobro za Toxttrick listu)
function htmlToText(html) {
  return (
    html
      // makni script/style blokove
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // razbij na “linije” oko važnih tagova
      .replace(/<\/tr>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|table|thead|tbody|tfoot)>/gi, "\n")
      // makni sve ostale tagove
      .replace(/<[^>]+>/g, " ")
      // decode par čestih entiteta
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // normalizacija razmaka
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim()
  );
}

function pickSectionText(fullText, team) {
  // Na stranici se pojavljuju sekcije:
  // “Selección Sub21” i “Selección Absoluta”
  const keyU21 = "Selección Sub21";
  const keyNT = "Selección Absoluta";

  const iU21 = fullText.indexOf(keyU21);
  const iNT = fullText.indexOf(keyNT);

  if (team === "u21") {
    if (iU21 === -1) return fullText;
    if (iNT === -1) return fullText.slice(iU21);
    return fullText.slice(iU21, iNT);
  }

  // team === "nt"
  if (iNT === -1) return fullText;
  return fullText.slice(iNT);
}

function parsePlayersFromText(sectionText) {
  const lines = sectionText
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const players = [];

  for (const line of lines) {
    // očekujemo da redak s igračem počinje s ID-jem (samo brojke)
    // pa negdje kasnije ima zemlju (Hrvatska/Croatia)
    // primjer (otprilike): "484961789 Drago Španjol Hrvatska 20 45 4 3 83,240 ..."
    if (!/^\d{6,}\s/.test(line)) continue;

    // mora sadržavati Croatia token
    if (!CRO_TOKENS.some((t) => line.includes(` ${t} `) || line.endsWith(` ${t}`))) continue;

    // pokušaj izvući: id, name, country, ageYears, ageDays, tsi, salary, deadline, asking
    // Minimalno: id + name + country + years
    const idMatch = line.match(/^(\d{6,})\s+(.*)$/);
    if (!idMatch) continue;

    const htId = idMatch[1];
    const rest = idMatch[2];

    // pronađi country token poziciju
    const countryToken = CRO_TOKENS.find((t) => rest.includes(` ${t} `) || rest.endsWith(` ${t}`));
    if (!countryToken) continue;

    const parts = rest.split(countryToken);
    const name = (parts[0] || "").trim();
    const afterCountry = (parts[1] || "").trim();

    // godina je prva brojka nakon zemlje
    const yearsMatch = afterCountry.match(/^(\d{1,2})\s+(\d{1,3})?\s*/);
    const ageYears = yearsMatch ? Number(yearsMatch[1]) : null;
    const ageDays = yearsMatch && yearsMatch[2] ? Number(yearsMatch[2]) : null;

    // iz istog stringa možemo pokušati izvući "Deadline" kao datum/čas (YYYY-MM-DD ...)
    const deadlineMatch = line.match(/\b(20\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\b/);
    const deadline = deadlineMatch ? deadlineMatch[1] : null;

    // Asking price (često na kraju, format 3.450.000 ili 4.299.999)
    const askingMatch = line.match(/(\d{1,3}(?:\.\d{3})+(?:\.\d{3})?)\s*$/);
    const askingPrice = askingMatch ? askingMatch[1] : null;

    players.push({
      htId: Number(htId),
      name,
      country: countryToken,
      ageYears,
      ageDays,
      deadline,
      askingPrice,
      toxttrickPlayerUrl: `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${htId}`,
    });
  }

  // ukloni duplikate po htId
  const seen = new Set();
  return players.filter((p) => (seen.has(p.htId) ? false : (seen.add(p.htId), true)));
}

export default async function handler(req, res) {
  try {
    const teamRaw = (req.query.team || "").toString().toLowerCase();
    const team = teamRaw === "u21" ? "u21" : teamRaw === "nt" ? "nt" : null;

    if (!team) {
      return res.status(400).json({ error: "Invalid team. Use /api/transfers/u21 or /api/transfers/nt" });
    }

    const r = await fetch(TOXTTRICK_URL, {
      headers: {
        "User-Agent": "HR-U21-NT-Tracker/1.0 (+vercel)",
        Accept: "text/html",
      },
    });

    if (!r.ok) {
      return res.status(502).json({ error: `Failed to fetch Toxttrick: ${r.status}` });
    }

    const html = await r.text();
    const text = htmlToText(html);

    const sectionText = pickSectionText(text, team);
    const players = parsePlayersFromText(sectionText);

    return res.status(200).json({
      team,
      source: TOXTTRICK_URL,
      count: players.length,
      players,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error", details: String(e?.message || e) });
  }
}
