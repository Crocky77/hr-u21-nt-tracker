import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

function teamLabel(team) {
  if (team === "u21") return "U21";
  if (team === "nt") return "NT";
  return "—";
}

function safeTeamSlug(qTeam) {
  const t = String(qTeam || "").toLowerCase();
  if (t === "nt" || t === "u21") return t;
  return "u21";
}

function isAuthError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("not authenticated") ||
    msg.includes("jwt") ||
    msg.includes("auth") ||
    msg.includes("permission") ||
    msg.includes("rls")
  );
}

export default function PlayerDetails() {
  const router = useRouter();
  const { id, team: teamQuery } = router.query;

  // TEAM je bitan za "← Igrači" link (da se vrati na /team/nt/players ili /team/u21/players)
  const team = useMemo(() => safeTeamSlug(teamQuery), [teamQuery]);
  const backHref = useMemo(() => `/team/${team}/players`, [team]);

  // State
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  // Access state (NE BLOKIRA render – da se nikad ne zaglavi na "Učitavam...")
  const [accessMode, setAccessMode] = useState("checking"); // checking | ok | denied
  const [accessMsg, setAccessMsg] = useState("");

  // Helper: fetch access (admin/coach) – ali stranica se rendera i dok traje provjera
  async function checkAccess() {
    try {
      const { data: u, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;

      const user = u?.user;
      if (!user) {
        setAccessMode("denied");
        setAccessMsg("Nisi prijavljen.");
        return;
      }

      const { data: profRows, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .limit(1);

      if (pErr) throw pErr;

      const role = profRows?.[0]?.role || null;
      if (role !== "admin" && role !== "coach") {
        setAccessMode("denied");
        setAccessMsg("Nemaš prava pristupa (potrebno: admin/coach).");
        return;
      }

      setAccessMode("ok");
      setAccessMsg("");
    } catch (e) {
      // Ako je auth/rls problem – pokaži poruku, ali NE ruši stranicu
      if (isAuthError(e)) {
        setAccessMode("denied");
        setAccessMsg("Pristup odbijen (auth).");
      } else {
        setAccessMode("denied");
        setAccessMsg(String(e?.message || e));
      }
    }
  }

  async function fetchPlayerAndSnapshot(playerId) {
    setLoading(true);
    setLoadError("");

    try {
      // 1) player
      const { data: pRows, error: pErr } = await supabase
        .from("players")
        .select(
          "id, full_name, ht_player_id, position, age_years, age_days, status, last_seen_at, nationality, wage, tsi, skill_gk, skill_def, skill_pm, skill_wing, skill_pass, skill_score, skill_sp"
        )
        .eq("id", playerId)
        .limit(1);

      if (pErr) throw pErr;

      const p = pRows?.[0] || null;
      setPlayer(p);

      // 2) snapshot (ako postoji)
      const { data: sRows, error: sErr } = await supabase
        .from("player_snapshots")
        .select(
          "id, player_id, team_slug, is_active, form, stamina, stamina_pct, tsi, training_type, intensity, coach_level, assistants_count, medic_count, form_coach_count, created_at"
        )
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sErr) throw sErr;

      setSnapshot(sRows?.[0] || null);
    } catch (e) {
      setLoadError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    // 1) access check (ne blokira UI)
    checkAccess();

    // 2) data fetch
    const pid = Number(id);
    if (!pid || Number.isNaN(pid)) {
      setLoading(false);
      setLoadError("Neispravan ID igrača.");
      return;
    }

    fetchPlayerAndSnapshot(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id]);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Hrvatski U21/NT Tracker</div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
            {player?.full_name || "Detalji igrača"}
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "#f0f0f0",
                fontSize: 12,
              }}
            >
              {teamLabel(team)}
            </span>
            {snapshot?.team_slug ? (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#f0f0f0",
                  fontSize: 12,
                }}
              >
                Snapshot: {String(snapshot.team_slug).toUpperCase()}
              </span>
            ) : null}
            {accessMode !== "ok" ? (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#fff3cd",
                  fontSize: 12,
                }}
              >
                {accessMode === "checking" ? "Provjera pristupa…" : `Pristup: ${accessMsg}`}
              </span>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={backHref}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              color: "black",
              fontWeight: 600,
            }}
          >
            ← Igrači
          </Link>
          <Link
            href="/"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              color: "black",
              fontWeight: 600,
            }}
          >
            Naslovna
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loadError ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #f5c2c7",
            background: "#f8d7da",
            marginBottom: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          Greška: {loadError}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
          Učitavam podatke…
        </div>
      ) : null}

      {!loading && !player ? (
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
          Igrač nije pronađen.
        </div>
      ) : null}

      {!loading && player ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* LEFT */}
          <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: 0, marginBottom: 10 }}>Osnovno</h3>
            <Row label="Interni ID" value={player.id} />
            <Row label="HT Player ID" value={player.ht_player_id || "—"} />
            <Row label="Pozicija" value={player.position || "—"} />
            <Row label="Dob" value={`${player.age_years ?? "—"}y ${player.age_days ?? "—"}d`} />
            <Row label="Status" value={player.status || "—"} />
            <Row label="Zadnje viđeno" value={player.last_seen_at || "—"} />
            <Row label="Nacionalnost" value={player.nationality || "—"} />
            <Row label="TSI" value={player.tsi ?? "—"} />
            <Row label="Plaća" value={player.wage ?? "—"} />
          </div>

          {/* RIGHT */}
          <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: 0, marginBottom: 10 }}>Snapshot (zadnji)</h3>
            {snapshot ? (
              <>
                <Row label="Forma" value={snapshot.form ?? "—"} />
                <Row label="Stamina" value={snapshot.stamina ?? "—"} />
                <Row label="Stamina %" value={snapshot.stamina_pct ?? "—"} />
                <Row label="Trening" value={snapshot.training_type ?? "—"} />
                <Row label="Intenzitet" value={snapshot.intensity ?? "—"} />
                <Row label="Coach level" value={snapshot.coach_level ?? "—"} />
                <Row label="Asistenti" value={snapshot.assistants_count ?? "—"} />
                <Row label="Medic" value={snapshot.medic_count ?? "—"} />
                <Row label="Form coach" value={snapshot.form_coach_count ?? "—"} />
                <Row label="Vrijeme" value={snapshot.created_at ?? "—"} />
              </>
            ) : (
              <div style={{ opacity: 0.8 }}>Nema snapshot podataka još.</div>
            )}
          </div>

          {/* SKILLS full width */}
          <div style={{ gridColumn: "1 / -1", border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
            <h3 style={{ margin: 0, marginBottom: 10 }}>Skillovi</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              <Skill label="GK" value={player.skill_gk} />
              <Skill label="DEF" value={player.skill_def} />
              <Skill label="PM" value={player.skill_pm} />
              <Skill label="WING" value={player.skill_wing} />
              <Skill label="PASS" value={player.skill_pass} />
              <Skill label="SCOR" value={player.skill_score} />
              <Skill label="SP" value={player.skill_sp} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px dashed #eee" }}>
      <div style={{ opacity: 0.75 }}>{label}</div>
      <div style={{ fontWeight: 700, textAlign: "right" }}>{String(value)}</div>
    </div>
  );
}

function Skill({ label, value }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{value ?? "—"}</div>
    </div>
  );
}
