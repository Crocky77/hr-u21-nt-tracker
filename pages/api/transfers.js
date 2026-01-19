// pages/api/transfers.js
// Privremeno rješenje bez CHPP-a:
// - povlači https://www.toxttrick.com/ (U21 + NT players for sale)
// - filtrira samo Hrvatska/Croatia
// - vraća JSON za UI

const TOXTTRICK_URL = "https://www.toxttrick.com/";

// jednostavno “čitanje” HTML-a u cell tekst:
// - img alt pretvara u tekst
// - briše HTML tagove
function htmlToText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<img[^>]*alt="([^"]+)"[^>]*>/gi, " $1 ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickSection(html, headingText) {
  // hvata dio od headinga do idućeg headinga istog nivoa (#### ...)
  // Na Toxttrick-u su sekcije "Selección Sub21" i "Selección Absoluta"
  const idx = html.indexOf(headingText);
  if (idx === -1) return null;
  const after = html.slice(idx);
  const nextIdx = after.slice(headingText.length).search(/####\s+/);
  if (nextIdx === -1) return after;
  return after.slice(0, headingText.length + nextIdx);
}

function extractFirstTable(sectionHtml) {
  if (!sectionHtml) return null;
  const m = sectionHtml.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  return m ? m[0] : null;
}

function extractRowsFromTable(tableHtml) {
  if (!tableHtml) return [];
  // split po <tr ...>
  const parts = tableHtml.split(/<tr[^>]*>/i);
  // prva part je prije prvog tr-a
  return parts.slice(1).map((p) => "<tr>" + p);
}

function extractCellsFromRow(rowHtml) {
  // uzmi sve <td>...</td>
  const cells = [];
  const re = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m;
  while ((m = re.exec(rowHtml)) !== null) {
    cells.push(m[1]);
  }
  return cells;
}

function extractPlayerLink(rowHtml) {
  // hvata prvi link (Toxttrick u praksi linka na Hattrick player page)
  const m = rowHtml.match(/<a[^>]*href="([^"]+)"[^>]*>/i);
  if (!m) return null;
  let href = m[1];
  if (href.startsWith("//")) href = "https:" + href;
  if (href.startsWith("/")) href = "https://www.toxttrick.com" + href;
  return href;
}

function isCroatia(countryText) {
  const t = (countryText || "").toLowerCase();
  return t.includes("hrvatska") || t.includes("croatia");
}

function parseSectionToPlayers(sectionHtml, teamType) {
  const table = extractFirstTable(sectionHtml);
  if (!table) return [];

  const rows = extractRowsFromTable(table);
  const out = [];

  for (const rowHtml of rows) {
    const cellHtmls = extractCellsFromRow(rowHtml);
    if (!cellHtmls || cellHtmls.length < 6) continue;

    // Pretvori u plain tekst
    const cells = cellHtmls.map(htmlToText);

    // očekujemo: [ID, Fullname, Country, ..., Deadline, Asking price, Highest bid]
    const idRaw = cells[0];
    const id = Number(String(idRaw).replace(/[^\d]/g, ""));
    const fullName = cells[1] || "";
    const country = cells[2] || "";

    if (!id || !fullName) continue;
    if (!isCroatia(country)) continue;

    const deadline = cells.length >= 3 ? cells[cells.length - 3] : "";
    const askingPrice = cells.length >= 2 ? cells[cells.length - 2] : "";
    const highestBid = cells.length >= 1 ? cells[cells.length - 1] : "";

    const href = extractPlayerLink(rowHtml);
    // ako link nije Hattrick, fallback na “standardni” Hattrick player URL
    const playerUrl =
      href && href.includes("hattrick.org")
        ? href
        : `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${id}`;

    out.push({
      team_type: teamType, // "U21" ili "NT"
      ht_player_id: id,
      full_name: fullName,
      country,
      deadline,
      asking_price: askingPrice,
      highest_bid: highestBid,
      url: playerUrl,
    });
  }

  return out;
}

export default async function handler(req, res) {
  try {
    const r = await fetch(TOXTTRICK_URL, {
      method: "GET",
      headers: {
        // malo “normalniji” user agent da nas ne blokira
        "User-Agent":
          "Mozilla/5.0 (compatible; HR-U21-NT-Tracker/1.0; +https://example.local)",
        Accept: "text/html,*/*",
      },
    });

    if (!r.ok) {
      return res.status(502).json({
        ok: false,
        error: `Toxttrick fetch failed (${r.status})`,
      });
    }

    const html = await r.text();

    // probamo obje varijante naslova (ovisno o jeziku na toj stranici)
    const u21Section =
      pickSection(html, "#### Selección Sub21") ||
      pickSection(html, "#### U21 Team") ||
      pickSection(html, "#### Selección Sub-21");

    const ntSection =
      pickSection(html, "#### Selección Absoluta") ||
      pickSection(html, "#### National Team") ||
      pickSection(html, "#### Selección absoluta");

    const u21 = parseSectionToPlayers(u21Section, "U21");
    const nt = parseSectionToPlayers(ntSection, "NT");

    return res.status(200).json({
      ok: true,
      source: TOXTTRICK_URL,
      updated_at: new Date().toISOString(),
      counts: { u21: u21.length, nt: nt.length, total: u21.length + nt.length },
      u21,
      nt,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e && e.message ? e.message : e),
    });
  }
}
