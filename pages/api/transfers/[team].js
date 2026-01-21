// pages/api/transfers/[team].js

const TOXTTRICK_URL = "https://www.toxttrick.com/index.php?lang=en";

// HR se na Toxttrick često prikazuje kao “Hrvatska” (ponekad “Croatia”)
const CRO_REGEX = /\b(Hrvatska|Croatia)\b/i;

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sliceBetween(html, startNeedle, endNeedle) {
  const low = html.toLowerCase();
  const s = low.indexOf(startNeedle.toLowerCase());
  if (s === -1) return null;

  const e = endNeedle ? low.indexOf(endNeedle.toLowerCase(), s + startNeedle.length) : -1;
  if (e === -1) return html.slice(s);
  return html.slice(s, e);
}

function extractSectionHtml(html, team) {
  // Toxttrick headings (na stranici su često španjolski)
  const U21_H = "Selección Sub21";
  const NT_H = "Selección Absoluta";

  if (team === "u21") {
    // između U21 headinga i NT headinga
    return sliceBetween(html, U21_H, NT_H) || html;
  }
  // team === "nt"
  return sliceBetween(html, NT_H, null) || html;
}

function parseAgeFromText(textAfterCountry) {
  const s = textAfterCountry.trim();

  // npr: "31 7 ..." (godine + dani)
  let m = s.match(/^(\d{1,2})\s+(\d{1,3})\b/);
  if (m) return { ageYears: Number(m[1]), ageDays: Number(m[2]) };

  // fallback samo godine
  m = s.match(/^(\d{1,2})\b/);
  if (m) return { ageYears: Number(m[1]), ageDays: null };

  return { ageYears: null, ageDays: null };
}

function parseRows(sectionHtml) {
  const rows = [];
  const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;

  let m;
  while ((m = trRe.exec(sectionHtml)) !== null) {
    rows.push(m[1]);
  }
  return rows;
}

function extractPlayerFromRow(rowHtml) {
  // 1) playerId (najčešće: ...Player.aspx?playerId=123456789)
  const idMatch =
    rowHtml.match(/playerId=(\d{6,})/i) ||
    rowHtml.match(/Player\.aspx\?playerId=(\d{6,})/i) ||
    rowHtml.match(/\b(\d{6,})\b/); // fallback (zadnje sredstvo)

  if (!idMatch) return null;
  const htId = Number(idMatch[1]);
  if (!htId) return null;

  // 2) country token (često je u alt/title atributu slike zastave)
  const countryMatch =
    rowHtml.match(/alt="([^"]+?)"/i) ||
    rowHtml.match(/title="([^"]+?)"/i);

  // U nekim redovima alt/title može biti za nešto drugo – zato dodatno provjerimo CRO_REGEX na cijelom rowu
  const rowText = stripTags(rowHtml);
  const hasCro = CRO_REGEX.test(rowText) || (countryMatch ? CRO_REGEX.test(countryMatch[1]) : false);
  if (!hasCro) return null;

  // Pokušaj “country” iz teksta (stabilnije za HR)
  const ct = rowText.match(CRO_REGEX);
  const country = ct ? ct[0] : (countryMatch ? countryMatch[1] : null);

  // 3) name: uzmi tekst iz reda i ukloni vodeći ID
  // (nije savršeno, ali je dovoljno dobro za listu)
  let name = rowText;

  // makni sve prije i uključujući prvi veliki broj (ID)
  name = name.replace(new RegExp(`^.*?\\b${htId}\\b\\s*`), "");

  // name je obično prije države
  if (country) {
    const idx = name.toLowerCase().indexOf(country.toLowerCase());
    if (idx !== -1) name = name.slice(0, idx).trim();
  }

  // 4) age: tekst nakon države obično počinje s “years days”
  let afterCountry = rowText;
  if (country) {
    const pos = rowText.toLowerCase().indexOf(country.toLowerCase());
    if (pos !== -1) afterCountry = rowText.slice(pos + country.length);
  }
  const { ageYears, ageDays } = parseAgeFromText(afterCountry);

  // 5) deadline (format na Toxttrick je “YYYY-MM-DD HH:MM:SS”)
  const deadlineMatch = rowText.match(/\b(20\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\b/);
  const deadline = deadlineMatch ? deadlineMatch[1] : null;

  // 6) asking price (na kraju reda često: 4.000.000)
  // uzmi zadnji “veliki broj” s točkama/zarezima
  let askingPrice = null;
  const priceMatch = rowText.match(/(\d{1,3}(?:[.,]\d{3})+|\b\d{7,}\b)\s*$/);
  if (priceMatch) askingPrice = priceMatch[1];

  return {
    htId,
    name: name || null,
    country,
    ageYears,
    ageDays,
    deadline,
    askingPrice,
    hattrickPlayerUrl: `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${htId}`,
  };
}

function parsePlayersFromSection(sectionHtml) {
  const players = [];
  const seen = new Set();

  const rows = parseRows(sectionHtml);

  for (const row of rows) {
    const p = extractPlayerFromRow(row);
    if (!p) continue;
    if (seen.has(p.htId)) continue;
    seen.add(p.htId);
    players.push(p);
  }

  // sort by deadline asc (ako postoji), inače po id
  players.sort((a, b) => {
    const da = a.deadline ? Date.parse(a.deadline.replace(" ", "T") + "Z") : null;
    const db = b.deadline ? Date.parse(b.deadline.replace(" ", "T") + "Z") : null;
    if (da != null && db != null) return da - db;
    if (da != null) return -1;
    if (db != null) return 1;
    return a.htId - b.htId;
  });

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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HR-U21-NT-Tracker",
        Accept: "text/html",
      },
    });

    if (!r.ok) {
      return res.status(502).json({ error: `Failed to fetch Toxttrick: ${r.status}` });
    }

    const html = await r.text();
    const sectionHtml = extractSectionHtml(html, team);
    const players = parsePlayersFromSection(sectionHtml);

    // (Opcionalno) debug: /api/transfers/nt?debug=1
    if (req.query.debug === "1") {
      return res.status(200).json({
        team,
        source: TOXTTRICK_URL,
        count: players.length,
        sample: players.slice(0, 5),
        htmlLength: html.length,
        fetchedAt: new Date().toISOString(),
      });
    }

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
