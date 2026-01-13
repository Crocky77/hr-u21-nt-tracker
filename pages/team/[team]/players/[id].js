import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../../components/AppLayout";
import { supabase } from "../../../../utils/supabaseClient";

function normalizeTeam(teamParam) {
  const t = String(teamParam || "").toLowerCase();
  if (t === "u21" || t === "u20") return "U21";
  if (t === "nt" || t === "senior") return "NT";
  return null;
}

// helper: sigurno prikazivanje
function val(v) {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const teamParam = router.query.team;
  const playerId = router.query.id;

  const teamType = useMemo(() => normalizeTeam(teamParam), [teamParam]);

  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [role, setRole] = useState("");
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      // session
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      const user = sessData?.session?.user;
      if (!user) {
        setAuthEmail("");
        setRole("");
        setPlayer(null);
        setLoading(false);
        return;
      }

      setAuthEmail(user.email || "");

      if (!teamType) {
        setPlayer(null);
        setRole("");
        setLoading(false);
        return;
      }

      // membership (da znamo rolu)
      const { data: memRows, error: memErr } = await supabase
        .from("team_memberships")
        .select("role, team_type")
        .eq("user_id", user.id);

      if (memErr) throw memErr;

      const mem = (memRows || []).find((m) => m.team_type === teamType);
      setRole(mem?.role || "");

      // Ako user nema membership za tim, nema detalja
      if (!mem) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      // player
      const idNum = Number(playerId);
      if (!idNum) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      // VAŽNO: NE SELECTAMO date_of_birth jer ne postoji u DB-u
      const { data: rows, error: pErr } = await supabase
        .from("players")
        .select("id, full_name, position, team_type, status, notes, ht_player_id, country_id, created_at")
        .eq("id", idNum)
        .single();

      if (pErr) throw pErr;

      // safety: ako igrač nije iz tog teamType, nemoj prikazivati
      if (rows?.team_type && rows.team_type !== teamType) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      setPlayer(rows || null);
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
  }, [router.isReady, teamType, playerId]);

  const backHref = teamParam ? `/team/${String(teamParam).toLowerCase()}/players` : "/";

  return (
    <AppLayout title="Detalji igrača">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Detalji igrača</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Aktivni tim: <b>{teamType || "—"}</b> · Ulogiran: <b>{authEmail || "—"}</b> · Rola: <b>{role || "—"}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href={backHref} style={{ textDecoration: "underline" }}>
            ← Povratak na popis
          </Link>
          <button
            onClick={load}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }}
          >
            Osvježi
          </button>
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

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.25)" }}>
          Greška: {error}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.8 }}>Učitavam igrača…</div>
      ) : !player ? (
        <div style={{ marginTop: 18, opacity: 0.85 }}>
          Igrač nije pronađen ili nemaš pristup.
        </div>
      ) : (
        <div style={{ marginTop: 18, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{player.full_name}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div><b>Team:</b> {val(player.team_type)}</div>
              <div><b>Pozicija:</b> {val(player.position)}</div>
              <div><b>Status:</b> {val(player.status)}</div>
              <div><b>HT ID:</b> {val(player.ht_player_id)}</div>
              <div><b>Country ID:</b> {val(player.country_id)}</div>
            </div>

            <div>
              <div><b>Bilješke:</b></div>
              <div style={{ marginTop: 6, padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.04)", minHeight: 70 }}>
                {val(player.notes)}
              </div>
              <div style={{ marginTop: 10, opacity: 0.75 }}>
                (V1) Ovdje je MVP prikaz. Kasnije dodajemo skill tablicu + snapshots + trening alarme.
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
