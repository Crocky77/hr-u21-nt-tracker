import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

function normalizeTeam(raw) {
  if (raw === "nt" || raw === "u21") return raw;
  return "u21";
}

function safeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== null && obj[k] !== undefined && obj[k] !== "") return obj[k];
  }
  return null;
}

async function getUserRole(userId) {
  // 1) user_profiles
  {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data?.role) return data.role;
  }

  // 2) users
  {
    const { data, error } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
    if (!error && data?.role) return data.role;
  }

  return "user";
}

async function loadLatestSnapshot(playerId, teamType) {
  // probamo prvo player_snapshots (tvoja nova tablica)
  const tableCandidates = ["player_snapshots", "player_snapshot"];

  for (const table of tableCandidates) {
    // 1) pokušaj s team_type filterom
    {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("player_id", playerId)
        .eq("team_type", teamType)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) return data || null;
    }

    // 2) fallback bez team_type (ako ta kolona ne postoji u toj tablici)
    {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) return data || null;
    }
  }

  return null;
}

export default function PlayerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const team = useMemo(() => normalizeTeam(router.query?.team), [router.query?.team]);
  const backHref = useMemo(() => `/team/${team}/players`, [team]);

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [role, setRole] = useState("user");

  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!id) return;

      setLoading(true);
      setAuthError("");
      setPageError("");
      setPlayer(null);
      setSnapshot(null);

      // AUTH
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user || null;

      if (cancelled) return;

      if (authErr || !user) {
        setAuthError("Nisi prijavljen. (Auth nije spojen u UI skroz, ali session mora postojati.)");
        setLoading(false);
        return;
      }

      // ROLE (nije kritično, ali lijepo za admin UI)
      try {
        const r = await getUserRole(user.id);
        if (!cancelled) setRole(r || "user");
      } catch {
        // ignore
      }

      // PLAYER
      const { data: pRow, error: pErr } = await supabase.from("players").select("*").eq("id", id).maybeSingle();

      if (cancelled) return;

      if (pErr) {
        setPageError(`Greška kod dohvaćanja igrača: ${pErr.message}`);
        setLoading(false);
        return;
      }
      if (!pRow) {
        setPageError("Igrač ne postoji (players.id nije pronađen).");
        setLoading(false);
        return;
      }

      setPlayer(pRow);

      // SNAPSHOT (zadnji)
      try {
        const sRow = await loadLatestSnapshot(Number(id), team);
        if (!cancelled) setSnapshot(sRow || null);
      } catch {
        // ignore – snapshot nije obavezan
      }

      if (!cancelled) setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id, team]);

  // Skills – prvo pokušaj snapshot.skills (ako je JSON), inače uzmi iz players polja
  const skills = useMemo(() => {
    const s = snapshot?.skills && typeof snapshot.skills === "object" ? snapshot.skills : null;

    const gk = pickFirst(s, ["gk", "skill_gk"]) ?? pickFirst(player, ["skill_gk", "gk", "skill_goalkeeping"]);
    const de = pickFirst(s, ["def", "de", "skill_def"]) ?? pickFirst(player, ["skill_def", "def", "de", "skill_defending"]);
    const pm = pickFirst(s, ["pm", "skill_pm"]) ?? pickFirst(player, ["skill_pm", "pm", "skill_playmaking"]);
    const wg = pickFirst(s, ["wing", "wg", "skill_wing"]) ?? pickFirst(player, ["skill_wing", "wing", "wg"]);
    const ps = pickFirst(s, ["pass", "ps", "skill_pass"]) ?? pickFirst(player, ["skill_pass", "pass", "ps"]);
    const sc = pickFirst(s, ["score", "sc", "skill_score"]) ?? pickFirst(player, ["skill_score", "score", "sc"]);
    const sp = pickFirst(s, ["sp", "skill_sp"]) ?? pickFirst(player, ["skill_sp", "sp", "skill_set_pieces"]);

    return {
      gk: gk ?? "—",
      de: de ?? "—",
      pm: pm ?? "—",
      wg: wg ?? "—",
      ps: ps ?? "—",
      sc: sc ?? "—",
      sp: sp ?? "—",
    };
  }, [player, snapshot]);

  if (!id) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
            <h1 className="hr-pageTitle" style={{ marginTop: 6 }}>
              {loading ? "Učitavam..." : safeText(player?.full_name || player?.name || "Detalji igrača")}
            </h1>
            <div className="hr-pageSub">
              Tim: <b>{team.toUpperCase()}</b> • Uloga: <b>{safeText(role)}</b>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={backHref}>
              ← Igrači
            </Link>
            <Link className="hr-backBtn" href="/">
              Naslovna
            </Link>
          </div>
        </div>

        {authError ? (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "rgba(255,0,0,0.08)" }}>
            <b>Pristup:</b> {authError}
          </div>
        ) : null}

        {pageError ? (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "rgba(255,0,0,0.08)" }}>
            <b>Greška:</b> {pageError}
          </div>
        ) : null}

        {loading ? (
          <div style={{ marginTop: 18, opacity: 0.7 }}>Učitavam detalje...</div>
        ) : null}

        {!loading && !authError && !pageError && player ? (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {/* OSNOVNO */}
            <div style={{ padding: 16, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: 0, marginBottom: 10 }}>Osnovno</h3>

              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 8, columnGap: 10 }}>
                <div>Interni ID</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.id)}</div>

                <div>HT Player ID</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.ht_player_id ?? "—")}</div>

                <div>Pozicija</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.position ?? player.pos ?? "—")}</div>

                <div>Dob</div>
                <div style={{ fontWeight: 600 }}>
                  {safeText(player.age_years ?? "—")}
                  {player.age_days !== undefined && player.age_days !== null ? `y ${player.age_days}d` : ""}
                </div>

                <div>Status</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.status ?? "—")}</div>

                <div>Nacionalnost</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.nationality ?? "—")}</div>

                <div>TSI</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.tsi ?? "—")}</div>

                <div>Plaća</div>
                <div style={{ fontWeight: 600 }}>{safeText(player.wage ?? "—")}</div>
              </div>
            </div>

            {/* SNAPSHOT */}
            <div style={{ padding: 16, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: 0, marginBottom: 10 }}>Snapshot (zadnji)</h3>

              {snapshot ? (
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 8, columnGap: 10 }}>
                  <div>Forma</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.form ?? "—")}</div>

                  <div>Stamina</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.stamina ?? "—")}</div>

                  <div>TSI</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.tsi ?? "—")}</div>

                  <div>Trening</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.training ?? "—")}</div>

                  <div>Intenzitet</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.intensity ?? "—")}</div>

                  <div>Stamina %</div>
                  <div style={{ fontWeight: 600 }}>{safeText(snapshot.stamina_percent ?? snapshot.stamina_pct ?? "—")}</div>
                </div>
              ) : (
                <div style={{ opacity: 0.7 }}>Nema snapshot podataka još.</div>
              )}
            </div>

            {/* SKILLOVI */}
            <div style={{ gridColumn: "1 / -1", padding: 16, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: 0, marginBottom: 10 }}>Skillovi</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(90px, 1fr))", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>GK</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.gk)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>DEF</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.de)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>PM</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.pm)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>WING</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.wg)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>PASS</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.ps)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>SCOR</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.sc)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>SP</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{safeText(skills.sp)}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
