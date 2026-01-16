// pages/team/[team]/players.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AppLayout from "../../../components/AppLayout";
import supabase from "../../../utils/supabaseClient";

function teamAccent(team) {
  const t = String(team || "").toLowerCase();
  if (t === "u21") return "u21";
  if (t === "nt") return "nt";
  return "global";
}

function teamLabel(team) {
  const t = String(team || "").toLowerCase();
  if (t === "u21") return "U21";
  if (t === "nt") return "NT";
  return team || "";
}

export default function TeamPlayers() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [q, setQ] = useState("");

  async function load() {
    if (!team) return;
    setLoading(true);

    // Ovdje koristimo tablicu "players" kao i do sada.
    // Ako ti je schema drugačija, barem će UI biti dobar; poslije uskladimo query.
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team", team)
      .order("name", { ascending: true });

    if (!error && Array.isArray(data)) setPlayers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return players;

    return players.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const pos = String(p.pos || p.position || "").toLowerCase();
      const status = String(p.status || "").toLowerCase();
      const ht = String(p.ht_id || p.htid || p.htId || "").toLowerCase();
      return (
        name.includes(s) ||
        pos.includes(s) ||
        status.includes(s) ||
        ht.includes(s)
      );
    });
  }, [players, q]);

  return (
    <AppLayout
      accent={teamAccent(team)}
      title={`Igrači – ${teamLabel(team)}`}
      subtitle="Search i tablica moraju biti čitljivi. Background nema ovdje."
      actions={
        <>
          <button className="hr-btn" onClick={load} disabled={loading}>
            Osvježi
          </button>
          <Link className="hr-btn hr-btnPrimary" href={`/team/${team}`}>
            Natrag na module
          </Link>
        </>
      }
    >
      <div className="hr-toolbar">
        <input
          className="hr-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija, status..."
        />
      </div>

      <div className="hr-muted" style={{ marginBottom: 10 }}>
        {loading ? "Učitavam..." : `Popis igrača (${filtered.length})`}
      </div>

      <div className="hr-tableWrap">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Ime</th>
              <th>Poz</th>
              <th>Status</th>
              <th>HT ID</th>
              <th>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="hr-muted">
                  Nema rezultata.
                </td>
              </tr>
            ) : null}

            {filtered.map((p) => {
              const id = p.id ?? p.player_id ?? p.playerId ?? null;
              return (
                <tr key={String(id ?? p.name ?? Math.random())}>
                  <td>{p.name ?? "—"}</td>
                  <td>{p.pos ?? p.position ?? "—"}</td>
                  <td>{p.status ?? "—"}</td>
                  <td>{p.ht_id ?? p.htid ?? p.htId ?? "—"}</td>
                  <td>
                    {id ? (
                      <Link
                        href={`/team/${team}/players/${id}`}
                        style={{ fontWeight: 900, textDecoration: "underline" }}
                      >
                        Detalji →
                      </Link>
                    ) : (
                      <span className="hr-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
