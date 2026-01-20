// pages/team/[team]/transfers.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function safeStr(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function hattrickPlayerUrl(playerId) {
  const id = toInt(playerId);
  if (!id) return null;
  // Standard HT player page
  return `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${id}`;
}

export default function TransfersTeamPage() {
  const router = useRouter();
  const team = safeStr(router.query.team || "").toLowerCase();

  const isValidTeam = team === "u21" || team === "nt";
  const teamLabel = team === "u21" ? "Hrvatska U21" : team === "nt" ? "Hrvatska NT" : "Tim";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ team, source: "", fetchedAt: null, count: 0, players: [] });

  useEffect(() => {
    if (!isValidTeam) return;

    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const r = await fetch(`/api/transfers/${team}`);
        const j = await r.json();

        if (!alive) return;

        setData({
          team: safeStr(j?.team || team),
          source: safeStr(j?.source || ""),
          fetchedAt: j?.fetchedAt || null,
          count: toInt(j?.count || 0),
          players: Array.isArray(j?.players) ? j.players : [],
        });
      } catch (e) {
        if (!alive) return;
        setError("Greška pri dohvaćanju podataka.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [team, isValidTeam]);

  const rows = useMemo(() => {
    const players = Array.isArray(data.players) ? data.players : [];
    return players.map((p, idx) => {
      // podrži više mogućih naziva polja (defenzivno)
      const name = safeStr(p?.name || p?.full_name || p?.fullName || p?.playerName || "");
      const age = safeStr(p?.age || p?.dob || p?.Age || "");
      const htId = safeStr(p?.htId || p?.ht_id || p?.ht_player_id || p?.playerId || p?.id || "");
      const deadline = safeStr(p?.deadline || p?.end || p?.endsAt || p?.ends_at || "");
      const asking = safeStr(p?.asking || p?.price || p?.traži || p?.trazi || p?.wanted || "");

      // prioritet:
      // 1) sourceUrl (ako postoji)
      // 2) hattrick url po HT ID-u
      const sourceUrl = safeStr(p?.sourceUrl || p?.source_url || p?.url || p?.playerUrl || "");
      const htUrl = hattrickPlayerUrl(htId);

      const clickUrl = sourceUrl || htUrl || "";

      return {
        key: `${htId || "row"}-${idx}`,
        name: name || "(nepoznato)",
        age,
        htId,
        deadline,
        asking,
        clickUrl,
        sourceUrl,
        htUrl,
      };
    });
  }, [data.players]);

  if (!isValidTeam) {
    return (
      <div className="hr-homeBg">
        <main className="hr-main">
          <div className="hr-container">
            <div className="hr-3dCard">
              <div className="hr-3dCardInner">
                <div style={{ fontWeight: 1000, fontSize: 24 }}>Transfer lista</div>
                <div style={{ marginTop: 8, opacity: 0.85 }}>
                  Neispravan tim. Koristi <b>/team/u21/transfers</b> ili <b>/team/nt/transfers</b>.
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="hr-homePill" href="/team/u21" style={{ textDecoration: "none" }}>
                    ← Natrag na U21 module
                  </Link>
                  <Link className="hr-homePill" href="/team/nt" style={{ textDecoration: "none" }}>
                    ← Natrag na NT module
                  </Link>
                  <Link className="hr-homePill" href="/" style={{ textDecoration: "none" }}>
                    Naslovnica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const testPlayerId = 453285255; // tvoj dokazani test
  const testHattrick = hattrickPlayerUrl(testPlayerId);
  const sourceLink = data.source || "https://www.toxttrick.com/index.php?lang=en";

  return (
    <div className="hr-homeBg">
      <main className="hr-main">
        <div className="hr-container">
          <div className="hr-3dCard">
            <div className="hr-3dCardInner">
              <div style={{ fontWeight: 1000, fontSize: 40, letterSpacing: -0.5 }}>Transfer lista</div>

              <div style={{ marginTop: 6, opacity: 0.85 }}>
                Tim: <b>{teamLabel}</b> · izvor:{" "}
                <a href={sourceLink} target="_blank" rel="noreferrer" style={{ fontWeight: 900 }}>
                  Toxttrick
                </a>{" "}
                (privremeno, bez CHPP)
              </div>

              {data.fetchedAt ? (
                <div style={{ marginTop: 6, opacity: 0.75 }}>Zadnje osvježenje: {String(data.fetchedAt)}</div>
              ) : null}

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="hr-homePill" href={`/team/${team}`} style={{ textDecoration: "none" }}>
                  ← Natrag na module
                </Link>
                <Link className="hr-homePill" href="/" style={{ textDecoration: "none" }}>
                  Naslovnica
                </Link>
              </div>

              <div style={{ marginTop: 18, fontWeight: 1000, fontSize: 34 }}>Ukupno: {loading ? "…" : rows.length}</div>

              {error ? (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(195,0,47,0.10)" }}>
                  {error}
                </div>
              ) : null}

              {/* TABLICA */}
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
                      <th style={{ textAlign: "left", padding: "10px 8px" }}>Igrač</th>
                      <th style={{ textAlign: "left", padding: "10px 8px" }}>Dob</th>
                      <th style={{ textAlign: "left", padding: "10px 8px" }}>HT ID</th>
                      <th style={{ textAlign: "left", padding: "10px 8px" }}>Deadline</th>
                      <th style={{ textAlign: "left", padding: "10px 8px" }}>Traži</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td style={{ padding: "14px 8px", opacity: 0.8 }} colSpan={5}>
                          Učitavam…
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td style={{ padding: "14px 8px", opacity: 0.8 }} colSpan={5}>
                          Nema rezultata.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.key} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                          <td style={{ padding: "12px 8px" }}>
                            {r.clickUrl ? (
                              <a
                                href={r.clickUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontWeight: 900, textDecoration: "underline" }}
                                title={r.sourceUrl ? "Otvori izvor (Toxttrick)" : "Otvori Hattrick"}
                              >
                                {r.name}
                              </a>
                            ) : (
                              <span style={{ fontWeight: 900 }}>{r.name}</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 8px" }}>{r.age || "-"}</td>
                          <td style={{ padding: "12px 8px" }}>{r.htId || "-"}</td>
                          <td style={{ padding: "12px 8px" }}>{r.deadline || "-"}</td>
                          <td style={{ padding: "12px 8px" }}>{r.asking || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* TEST BLOK (fallback kad je 0) */}
              <div
                className="hr-3dCard"
                style={{ marginTop: 16, background: "rgba(0,0,0,0.03)" }}
              >
                <div className="hr-3dCardInner">
                  <div style={{ fontWeight: 1000, fontSize: 22 }}>Test linkovi (provjera klika)</div>
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Kad nema HR igrača na TL, ovdje možeš provjeriti otvaranje linkova:
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      className="hr-homePill"
                      href={testHattrick}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      Test: Hattrick player ({testPlayerId}) ↗
                    </a>

                    <a
                      className="hr-homePill"
                      href={sourceLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      Izvor: Toxttrick ↗
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, opacity: 0.8 }}>
                Napomena: ovo je privremeno (scrape). Kad dođe CHPP licenca, zamjenjujemo izvor podataka.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
                    }
