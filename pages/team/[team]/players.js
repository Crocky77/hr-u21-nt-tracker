// pages/team/[team]/players.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function normalizeTeamParam(teamParam) {
  if (!teamParam) return null;
  const t = String(teamParam).toLowerCase();
  if (t === "u21") return "U21";
  if (t === "nt") return "NT";
  return String(teamParam).toUpperCase();
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const teamParam = router.query.team;

  const teamType = useMemo(() => normalizeTeamParam(teamParam), [teamParam]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const [players, setPlayers] = useState([]);

  async function loadPlayers() {
    if (!teamType) return;

    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("players")
      // ✅ STANDARD: koristimo ht_player_id (ne ht_id)
      .select("id, full_name, position, status, ht_player_id")
      .eq("team_type", teamType)
      .order("full_name", { ascending: true });

    if (error) {
      setErr(error.message || "Greška kod dohvaćanja igrača.");
      setPlayers([]);
      setLoading(false);
      return;
    }

    setPlayers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!router.isReady) return;
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, teamType]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return players;

    return players.filter((p) => {
      const name = (p.full_name || "").toLowerCase();
      const pos = (p.position || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const ht = p.ht_player_id ? String(p.ht_player_id) : "";
      return name.includes(s) || pos.includes(s) || status.includes(s) || ht.includes(s);
    });
  }, [players, q]);

  const title = teamType ? `Igrači – ${teamType}` : "Igrači";

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>

        <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: ime, HT ID, pozicija, status..."
            style={{
              flex: "1 1 320px",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={loadPlayers}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ccc",
              cursor: "pointer",
              fontWeight: 700,
              background: "#fff",
            }}
          >
            Osvježi
          </button>

          <Link
            href={`/team/${String(teamParam || "").toLowerCase()}/dashboard`}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ccc",
              textDecoration: "none",
              fontWeight: 700,
              background: "#fff",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Dashboard
          </Link>
        </div>

        {loading ? <p>Učitavam...</p> : null}
        {err ? <p style={{ color: "crimson" }}>Greška: {err}</p> : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ marginBottom: 8, opacity: 0.8 }}>Popis igrača ({filtered.length})</div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#f4f4f4" }}>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Ime</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Poz</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>HT ID</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Akcija</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", fontWeight: 700 }}>
                      {p.full_name || "—"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{p.position || "—"}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{p.status || "—"}</td>

                    {/* ✅ STANDARD: prikazujemo ht_player_id */}
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                      {p.ht_player_id ? String(p.ht_player_id) : "—"}
                    </td>

                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                      {/* Detalji idu preko internog players.id (uvijek postoji) */}
                      <Link
                        href={`/team/${String(teamParam || "").toLowerCase()}/players/${p.id}`}
                        style={{ fontWeight: 800, textDecoration: "none" }}
                      >
                        Detalji →
                      </Link>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 12 }}>
                      Nema igrača.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
