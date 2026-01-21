// pages/api/transfers/[team].js

const TOXTTRICK_URL = "https://www.toxttrick.com/index.php?lang=en";

// “Croatia” se na Toxttrick često prikazuje kao “Hrvatska”
const CRO_REGEX = /\b(Hrvatska|Croatia)\b/i;

// Mogući naslovi sekcija na Toxttrick (ovisno o jeziku/labelama)
const SECTION_MARKERS = {
  u21: [
    "Selección Sub21",
    "Selection U21",
    "U21 Selection",
    "U21 National Team",
    "National Team U21",
    "Nazionale U21",
    "Under 21",
  ],
  nt: [
    "Selección Absoluta",
    "Selection Senior",
    "Senior Selection",
    "National Team",
    "Senior National Team",
    "Nazionali",
    "Senior",
  ],
};

// Super jednostavan “HTML -> text” (dovoljno dobro za Toxttrick listu)
function htmlToText(html) {
  return (
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // razbij na “linije” oko važnih tagova
      .replace(/<\/tr>/gi, "\n")
      .replace(/<\/td>/gi, " ") // bitno: ćelije razdvojimo razmakom
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|table|thead|tbody|tfoot|li)>/gi, "\n")
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

function findFirstMarkerIndex(fullText, markers) {
  let best = -1;
  for (const m of markers) {
    const i = fullText.toLowerCase().indexOf(m.toLowerCase());
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  return best;
}

function pickSectionText(fullText, team) {
  // Pokušaj pronaći početak U21/NT sekcije po više mogućih marker-a.
  // Ako ništa ne nađe, NE REŽI — vrati cijeli tekst (pa će Croatia filter odraditi svoje).
  const iU21 = findFirstMarkerIndex(fullText, SECTION_MARKERS.u21);
  const iNT = findFirstMarkerIndex(fullText, SECTION_MARKERS.nt);

  if (team === "u21") {
    if (iU21 === -1) return fullText;
    if (iNT === -1) return fullText.slice(iU21);
    return iU21 < iNT ? fullText.slice(iU21, iNT) : fullText.slice(iU21);
  }

  // team === "nt"
  if (iNT === -1) return fullText;
  return fullText.slice(iNT);
}

// pokušaj parsiranja dobi iz teksta nakon zemlje:
// - "20 45"
// - "20y 45d"
// - "20y45d"
function parseAge(afterCountry) {
  const s = afterCountry.trim();

  // 20 45
  let m = s.match(/^(\d{1,2})\s+(\d{1,3})\b/);
  if (m) return { ageYears: Number(m[1]), ageDays: Number(m[2]) };

  // 20y45d ili 20y 45d
  m = s.match(/^(\d{1,2})\s*y\s*(\d{1,3})\s*d\b/i);
  if (m) return { ageYears: Number(m[1]), ageDays: Number(m[2]) };

  // samo godine
  m = s.match(/^(\d{1,2})\b/);
  if (m) return { ageYears: Number(m[1]), ageDays: null };

  return { ageYears: null, ageDays: null };
}

function parsePlayersFromText(sectionText) {
  const lines = sectionText
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const players = [];
  const seen = new Set();

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // mora sadržavati Croatia/Hrvatska kao riječ (ne ovisi o razmacima oko nje)
    if (!CRO_REGEX.test(line)) continue;

    // očekujemo da redak s igračem počinje s HT ID (broj) — ali dozvoli i slučaj da ima vodeći tekst pa uhvati prvi veliki broj
    // Primarno: ^(\d{6,})
    // Fallback: bilo gdje (\b\d{6,}\b)
    let idMatch = line.match(/^(\d{6,})\b\s+(.*)$/);
    if (!idMatch) {
      const anyId = line.match(/\b(\d{6,})\b/);
      if (!anyId) continue;
      const htId = anyId[1];
      // pokušaj odrezati sve prije ID-a da dobijemo “rest”
      const idx = line.indexOf(htId);
      const rest2 = line.slice(idx + htId.length).trim();
      idMatch = [line, htId, rest2];
    }

    const htId = Number(idMatch[1]);
    const rest = (idMatch[2] || "").trim();

    if (!htId || seen.has(htId)) continue;

    // pronađi točan token zemlje u rest (sačuvaj izvorni oblik Croatia/Hrvatska)
    const countryMatch = rest.match(CRO_REGEX);
    if (!countryMatch) continue;

    const countryToken = countryMatch[0];
    const beforeCountry = rest.slice(0, countryMatch.index).trim();
    const afterCountry = rest.slice(countryMatch.index + countryToken.length).trim();

    const name = beforeCountry; // na Toxttrick listi je prije zemlje obično ime

    const { ageYears, ageDays } = parseAge(afterCountry);

    // Deadline (ako postoji)
    const deadlineMatch = line.match(/\b(20\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\b/);
    const deadline = deadlineMatch ? deadlineMatch[1] : null;

    // Asking price (razni formati: 3.450.000 ili 3,450,000 ili 3450000)
    let askingPrice = null;
    const askingMatch = line.match(/(\d{1,3}(?:[.,]\d{3})+|\b\d{7,}\b)\s*$/);
    if (askingMatch) askingPrice = askingMatch[1];

    players.push({
      htId,
      name,
      country: countryToken,
      ageYears,
      ageDays,
      deadline,
      askingPrice,
      toxttrickPlayerUrl: `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${htId}`,
    });

    seen.add(htId);
  }

  return players;
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
