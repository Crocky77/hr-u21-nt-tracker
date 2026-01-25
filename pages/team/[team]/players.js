import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState([]);

  async function fetchPlayers(teamSlug) {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc("list_team_players", {
      p_team_slug: teamSlug,
    });

    if (error) {
      setError(error.message || "Greška kod dohvaćanja igrača.");
      setPlayers([]);
      setLoading(false);
      return;
    }

    const rows = Array.isArray(data) ? data : [];

    // privremeni dedupe (da bar UI ne pokazuje duplo) - pravi fix baze radimo poslije
    const seen = new Set();
    const deduped = [];
    for (const r of rows) {
      const key = r?.ht_id ?? r?.ht_player_id ?? r?.id;
      if (key == null) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(r);
    }

    setPlayers(deduped);
    setLoading(false);
  }

  useEffect(() => {
    if (!team) return;
    fetchPlayers(String(team));
  }, [team]);

  const displayPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const an = (a?.full_name ?? a?.name ?? "").toString();
      const bn = (b?.full_name ?? b?.name ?? "").toString();
      return an.localeCompare(bn, "hr");
    });
  }, [players]);

  const teamSlug = team ? String(team) : "";
  const teamUpper = teamSlug ? teamSlug.toUpperCase() : "";

  return (
    <div style={page}>
      <div style={container}>
        <div style={topbar}>
          <div>
            <h1 style={{ margin: 0 }}>Igrači ({teamUpper})</h1>
            <div style={{ marginTop: 6, opacity: 0.75 }}>
              Aktivni tim: <b>{teamSlug}</b>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href={`/team/${teamSlug}`}>Natrag na module</Link>
            <Link href={`/team/${teamSlug}/players`}>Popis igrača</Link>
          </div>
        </div>

        {loading && <p>Učitavanje...</p>}

        {!loading && error && (
          <div style={errBox}>
            <b>Greška:</b> {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Ime</th>
                  <th style={th}>Poz</th>
                  <th style={th}>God</th>
                  <th style={th}>HTID</th>
                  <th style={th}>Fo</th>
                  <th style={th}>St</th>
                  <th style={th}>TR</th>
                  <th style={th}>DE</th>
                  <th style={th}>PM</th>
                  <th style={th}>SC</th>
                  <th style={th}>SP</th>
                </tr>
              </thead>
              <tbody>
                {displayPlayers.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={11}>
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  displayPlayers.map((p) => {
                    const name = p?.full_name ?? p?.name ?? "—";
                    const pos = p?.position ?? p?.pos ?? "—";
                    const age = p?.age ?? p?.age_years ?? "—";
                    const htId = p?.ht_id ?? p?.ht_player_id ?? "—";
                    const href = `/players/${p.id}?team=${teamSlug}`;

                    return (
                      <tr
                        key={`${p?.id}-${htId}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push(href)}
                      >
                        {/* ✅ ime je pravi Link (ako click na red ikad “zakaže”, Link i dalje radi) */}
                        <td style={td}>
                          <Link href={href} style={{ textDecoration: "none" }}>
                            {name}
                          </Link>
                        </td>
                        <td style={td}>{pos}</td>
                        <td style={td}>{age}</td>
                        <td style={td}>{htId}</td>
                        <td style={td}>{p?.fo ?? p?.form ?? "—"}</td>
                        <td style={td}>{p?.st ?? p?.stamina ?? "—"}</td>
                        <td style={td}>{p?.tr ?? p?.trainer ?? "—"}</td>
                        <td style={td}>{p?.def ?? p?.de ?? "—"}</td>
                        <td style={td}>{p?.pm ?? "—"}</td>
                        <td style={td}>{p?.sc ?? "—"}</td>
                        <td style={td}>{p?.sp ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <p style={{ marginTop: 10, opacity: 0.7 }}>
              Klik na red ili ime otvara detalje igrača.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const page = {
  padding: "24px 16px",
};

const container = {
  maxWidth: 1200, // ✅ margine lijevo/desno
  margin: "0 auto",
};

const topbar = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
};

const errBox = {
  marginTop: 12,
  padding: 12,
  border: "1px solid #f2b8b5",
  background: "#fff3f2",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #ddd",
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};
