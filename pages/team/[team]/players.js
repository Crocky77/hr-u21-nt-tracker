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

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const teamType = useMemo(() => normalizeTeamParam(teamParam), [teamParam]);

  async function loadPlayers() {
    if (!teamType) return;

    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("players")
      .select("id, full_name, position, status, ht_id")
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
      const ht = p.ht_id ? String(p.ht_id) : "";
      return (
        name.includes(s) ||
        pos.includes(s) ||
        status.includes(s) ||
        ht.includes(s)
      );
    });
  }, [players, q]);

  const title = teamType ? `Igrači – ${teamType}` : "Igrači";

  return (
    <AppLayout title={title}>
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
          }}
        >
          Osvježi
        </button>
      </div>

      {loading ? <p>Učitavam...</p> : null}
      {err ? <p style={{ color: "crimson" }}>Greška: {err}</p> : null}

      <div style={{ marginTop: 14 }}>
        <div style={{ marginBottom: 8, opacity: 0.8 }}>
          Popis igrača ({filtered.length})
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                  Ime
                </th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                  Poz
                </th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                  Status
                </th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                  HT ID
                </th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                  Akcija
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee", fontWeight: 700 }}>
                    {p.full_name || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {p.position || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {p.status || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {p.ht_id ? String(p.ht_id) : "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {/* KLJUČNO: id je uvijek validan; ht_id može biti null */}
                    <Link href={`/team/${String(teamParam).toLowerCase()}/players/${p.id}`}>
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
    </AppLayout>
  );
}
