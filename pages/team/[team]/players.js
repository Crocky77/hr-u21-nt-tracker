import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function normalizeTeam(teamParam) {
  const t = String(teamParam || "").toLowerCase();
  if (t === "u21" || t === "u20") return "U21";
  if (t === "nt" || t === "senior") return "NT";
  return null;
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const teamParam = router.query.team;

  const teamType = useMemo(() => normalizeTeam(teamParam), [teamParam]);

  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [role, setRole] = useState("");
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      // 1) user session
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      const user = sessData?.session?.user;
      if (!user) {
        setAuthEmail("");
        setRole("");
        setPlayers([]);
        setLoading(false);
        return;
      }

      const email = user.email || "";
      setAuthEmail(email);

      if (!teamType) {
        setPlayers([]);
        setRole("");
        setLoading(false);
        return;
      }

      // 2) membership + role (team-based)
      // očekujemo tablicu public.team_memberships (user_id, team_type, role)
      const { data: memRows, error: memErr } = await supabase
        .from("team_memberships")
        .select("role, team_type")
        .eq("user_id", user.id);

      if (memErr) throw memErr;

      const mem = (memRows || []).find((m) => m.team_type === teamType);
      const r = mem?.role || "";
      setRole(r);

      // Ako nema membership za taj team – ne pokazuj igrače
      if (!mem) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      // 3) players by ROUTE teamType (NE "moj tim")
      const { data: rows, error: pErr } = await supabase
        .from("players")
        .select("id, full_name, position, team_type, status, ht_player_id, created_at")
        .eq("team_type", teamType)
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;

      setPlayers(rows || []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, teamType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const name = (p.full_name || "").toLowerCase();
      const pos = (p.position || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const ht = String(p.ht_player_id || "").toLowerCase();
      return name.includes(q) || pos.includes(q) || status.includes(q) || ht.includes(q);
    });
  }, [players, search]);

  const title = teamType ? `Igrači – ${teamType}` : "Igrači";

  return (
    <AppLayout title={title}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Ulogiran: <b>{authEmail || "—"}</b> · Rola: <b>{role || "—"}</b> · Ruta tim: <b>{teamType || "—"}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "underline" }}>Odaberi tim</Link>
          {teamType && <Link href={`/team/${String(teamParam).toLowerCase()}/dashboard`} style={{ textDecoration: "underline" }}>Dashboard</Link>}
          {teamType && <Link href={`/team/${String(teamParam).toLowerCase()}/alerts`} style={{ textDecoration: "underline" }}>Upozorenja</Link>}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }}
          >
            Odjava
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija, status…"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)" }}
        />
        <button
          onClick={load}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }}
        >
          Osvježi
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.25)" }}>
          Greška: {error}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.8 }}>Učitavanje…</div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 10 }}>Popis igrača ({filtered.length})</h3>

          {filtered.length === 0 ? (
            <div style={{ opacity: 0.8 }}>
              Nema rezultata. (Ako si admin i ubacio si test igrače, provjeri da su u team_type = <b>{teamType}</b>)
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.5fr 0.7fr 0.7fr 0.7fr", gap: 0, padding: "10px 12px", fontWeight: 700, background: "rgba(0,0,0,0.04)" }}>
                <div>Ime</div>
                <div>Poz</div>
                <div>Status</div>
                <div>HT ID</div>
                <div>Akcija</div>
              </div>

              {filtered.map((p) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.5fr 0.7fr 0.7fr 0.7fr", gap: 0, padding: "10px 12px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                  <div>{p.position || "—"}</div>
                  <div>{p.status || "—"}</div>
                  <div>{p.ht_player_id || "—"}</div>
                  <div>
                    <Link
                      href={`/team/${String(teamParam).toLowerCase()}/players/${p.id}`}
                      style={{ textDecoration: "underline" }}
                    >
                      Detalji →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
