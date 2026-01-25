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

    // ✅ Supabase RPC traži argument "p_team_slug" (ne "team_slug")
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

    // ✅ Privremeni fix za duple unose (dedupe po HTID ako postoji, inače po internom id)
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
    // Sort po imenu za stabilan prikaz
    return [...players].sort((a, b) => {
      const an = (a?.full_name ?? a?.name ?? "").toString();
      const bn = (b?.full_name ?? b?.name ?? "").toString();
      return an.localeCompare(bn, "hr");
    });
  }, [players]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>
          Igrači ({String(team || "").toUpperCase()})
        </h1>

        {/* ✅ Ovdje link uvijek vraća na ispravan team modul */}
        <Link href={`/team/${team}`}>
          Natrag na module
        </Link>
      </div>

      {loading && <p>Učitavanje...</p>}

      {!loading && error && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f2b8b5", background: "#fff3f2" }}>
          <b>Greška:</b> {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  <td style={td} colSpan={11}>Nema podataka.</td>
                </tr>
              ) : (
                displayPlayers.map((p) => {
                  const name = p?.full_name ?? p?.name ?? "—";
                  const pos = p?.position ?? p?.pos ?? "—";
                  const age = p?.age ?? p?.age_years ?? "—";
                  const htId = p?.ht_id ?? p?.ht_player_id ?? "—";

                  return (
                    <tr
                      key={`${htId}-${p?.id ?? ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/players/${p.id}?team=${team}`)}
                    >
                      <td style={td}>{name}</td>
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

          <p style={{ marginTop: 8, opacity: 0.7 }}>
            Klik na red otvara detalje igrača.
          </p>
        </div>
      )}
    </div>
  );
}

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
