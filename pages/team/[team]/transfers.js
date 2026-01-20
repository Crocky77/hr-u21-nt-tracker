import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function hattrickPlayerUrl(htId) {
  const id = String(htId || "").trim();
  if (!id) return null;
  return `https://www.hattrick.org/Club/Players/Player.aspx?playerId=${encodeURIComponent(id)}`;
}

export default function TeamTransfersPage() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();

  const [data, setData] = useState({
    team: team || "",
    source: "",
    count: 0,
    players: [],
    fetchedAt: null,
  });
  const [loading, setLoading] = useState(true);

  const titleTeam = useMemo(() => {
    if (team === "u21") return "Hrvatska U21";
    if (team === "nt") return "Hrvatska NT";
    return team ? team.toUpperCase() : "";
  }, [team]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!team) return;

      setLoading(true);
      try {
        const r = await fetch(`/api/transfers/${team}`).then((x) => x.json());
        if (!alive) return;

        setData({
          team: r?.team || team,
          source: r?.source || "",
          count: Number(r?.count || 0),
          players: Array.isArray(r?.players) ? r.players : [],
          fetchedAt: r?.fetchedAt || null,
        });
      } catch (e) {
        if (!alive) return;
        setData({
          team,
          source: "",
          count: 0,
          players: [],
          fetchedAt: null,
        });
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [team]);

  const noResults = !loading && (!data.players || data.players.length === 0);

  // TEST: poznati HT ID (samo za provjeru klika kad nema rezultata)
  const testHtId = "453285255";
  const testHtUrl = hattrickPlayerUrl(testHtId);

  return (
    <div className="hr-homeBg">
      <main className="hr-main">
        <div className="hr-container">
          <div className="hr-3dCard" style={{ marginTop: 16 }}>
            <div className="hr-3dCardInner">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 34, fontWeight: 1000, letterSpacing: -0.5 }}>Transfer lista</div>
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Tim: <b>{titleTeam || "—"}</b> · izvor:{" "}
                    {data.source ? (
                      <a href={data.source} target="_blank" rel="noreferrer" style={{ fontWeight: 900 }}>
                        Toxttrick
                      </a>
                    ) : (
                      <b>Toxttrick</b>
                    )}{" "}
                    (privremeno, bez CHPP)
                  </div>
                  {data.fetchedAt ? (
                    <div style={{ marginTop: 6, opacity: 0.7, fontSize: 12 }}>
                      Zadnje osvježenje: {String(data.fetchedAt)}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Link className="hr-homePill" href={`/team/${team}`} style={{ textDecoration: "none" }}>
                    ← Natrag na module
                  </Link>
                  <Link className="hr-homePill" href="/" style={{ textDecoration: "none" }}>
                    Naslovnica
                  </Link>
                </div>
              </div>

              <div style={{ marginTop: 14, fontSize: 22, fontWeight: 900 }}>
                Ukupno: {loading ? "…" : data.count || 0}
              </div>

              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Igrač</th>
                      <th style={thStyle}>Dob</th>
                      <th style={thStyle}>HT ID</th>
                      <th style={thStyle}>Deadline</th>
                      <th style={thStyle}>Traži</th>
                    </tr>
                  </thead>

                  <tbody>
                    {noResults ? (
                      <tr>
                        <td style={tdStyleMuted} colSpan={5}>
                          Nema rezultata.
                        </td>
                      </tr>
                    ) : null}

                    {(data.players || []).map((p, idx) => {
                      const name = p?.name || p?.player_name || p?.player || "Igrač";
                      const age = p?.age ?? p?.dob ?? p?.years ?? "";
                      const htId = p?.ht_id ?? p?.htId ?? p?.playerId ?? p?.id ?? "";
                      const deadline = p?.deadline ?? p?.ends ?? p?.end ?? "";
                      const asking = p?.asking ?? p?.price ?? p?.wanted ?? "";

                      const htUrl = hattrickPlayerUrl(htId);

                      return (
                        <tr key={`${String(htId || "")}-${idx}`}>
                          <td style={tdStyle}>
                            {htUrl ? (
                              <a
                                href={htUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontWeight: 900, textDecoration: "none" }}
                                title="Otvori igrača na Hattricku"
                              >
                                {name}
                              </a>
                            ) : (
                              <span style={{ fontWeight: 900 }}>{name}</span>
                            )}
                          </td>

                          <td style={tdStyle}>{String(age || "")}</td>

                          <td style={tdStyle}>
                            {htUrl ? (
                              <a
                                href={htUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontWeight: 900, textDecoration: "none" }}
                                title="Otvori igrača na Hattricku"
                              >
                                {String(htId || "")}
                              </a>
                            ) : (
                              <span>{String(htId || "")}</span>
                            )}
                          </td>

                          <td style={tdStyle}>{String(deadline || "")}</td>
                          <td style={tdStyle}>{String(asking || "")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* TEST BLOK - samo kad nema rezultata */}
              {noResults ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontWeight: 1000, marginBottom: 6 }}>Test linkovi (provjera klika)</div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>
                    Kad nema HR igrača na TL, ovdje možeš provjeriti otvaranje Hattrick player stranice:
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={testHtUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hr-homePill"
                      style={{ textDecoration: "none" }}
                      title="Test: otvori Hattrick igrača"
                    >
                      Test: Hattrick player ({testHtId}) ↗
                    </a>

                    {data.source ? (
                      <a
                        href={data.source}
                        target="_blank"
                        rel="noreferrer"
                        className="hr-homePill"
                        style={{ textDecoration: "none" }}
                        title="Otvori izvor"
                      >
                        Izvor: Toxttrick ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 12, opacity: 0.8 }}>
                Napomena: ovo je privremeno (scrape). Kad dođe CHPP licenca, zamjenjujemo izvor podataka.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 12px",
  fontWeight: 1000,
  borderBottom: "1px solid rgba(0,0,0,0.10)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const tdStyleMuted = {
  padding: "14px 12px",
  opacity: 0.75,
};
