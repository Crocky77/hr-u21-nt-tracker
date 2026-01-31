import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AppLayout from "../../components/AppLayout";
import TrackerSidebar from "../../components/TrackerSidebar";
import { supabase } from "../../utils/supabaseClient";

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id, team } = router.query;

  const teamSlug = useMemo(() => {
    const t = (team || "u21").toString().toLowerCase();
    return t === "nt" ? "nt" : "u21";
  }, [team]);

  const backHref = useMemo(() => `/team/${teamSlug}/players`, [teamSlug]);

  const [loading, setLoading] = useState(true);
  const [roleText, setRoleText] = useState("—");
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function getUserRoleSafe() {
      try {
        const up = await supabase.from("user_profiles").select("*").limit(1).maybeSingle();
        if (up?.data && typeof up.data.role !== "undefined") return String(up.data.role);

        const pr = await supabase.from("profiles").select("*").limit(1).maybeSingle();
        if (pr?.data && typeof pr.data.role !== "undefined") return String(pr.data.role);

        const us = await supabase.from("users").select("*").limit(1).maybeSingle();
        if (us?.data && typeof us.data.role !== "undefined") return String(us.data.role);

        return "—";
      } catch (e) {
        return "—";
      }
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        const role = await getUserRoleSafe();
        if (!cancelled) setRoleText(role || "—");

        const pRes = await supabase
          .from("players")
          .select("*")
          .eq("id", Number(id))
          .maybeSingle();
        if (pRes.error) throw new Error(pRes.error.message || "Greška kod učitavanja igrača.");
        if (!cancelled) setPlayer(pRes.data || null);

        try {
          const sRes = await supabase
            .from("player_snapshots")
            .select("*")
            .eq("player_id", Number(id))
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!sRes.error && !cancelled) setSnapshot(sRes.data || null);
        } catch (e) {
          // ignore
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Greška.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const ageText =
    player &&
    typeof player.age_years !== "undefined" &&
    typeof player.age_days !== "undefined"
      ? `${player.age_years}y ${player.age_days}d`
      : "—";

  return (
    <AppLayout fullWidth>
      <div className="shell">
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        <div className="main">
          <div className="header">
            <div>
              <h1>{player?.name || player?.full_name || "Detalji igrača"}</h1>
              <div className="sub">
                Tim: <b>{teamSlug.toUpperCase()}</b> · Uloga: <b>{roleText}</b>
              </div>
            </div>

            <div className="actions">
              <Link className="ghostBtn" href={backHref}>
                ← Igrači
              </Link>
              <Link className="ghostBtn" href={`/team/${teamSlug}`}>
                Naslovna
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="card">Učitavam...</div>
          ) : null}

          {error ? (
            <div className="error">Greška: {error}</div>
          ) : null}

          {!loading && !error && !player ? (
            <div className="card">Igrač nije pronađen.</div>
          ) : null}

          {!loading && !error && player ? (
            <div className="grid">
              <div className="card">
                <div className="cardTitle">Osnovno</div>
                <div className="rows">
                  <Row label="Interni ID" value={player.id} />
                  <Row label="HT Player ID" value={player.ht_player_id ?? "—"} />
                  <Row label="Pozicija" value={player.position ?? "—"} />
                  <Row label="Dob" value={ageText} />
                  <Row label="Status" value={player.status ?? "—"} />
                  <Row label="Nacionalnost" value={player.nationality ?? "Hrvatska"} />
                  <Row label="TSI" value={player.tsi ?? "—"} />
                  <Row label="Plaća" value={player.salary ?? "—"} />
                </div>
              </div>

              <div className="card">
                <div className="cardTitle">Snapshot (zadnji)</div>
                {snapshot ? (
                  <div className="snapshot">
                    <div>
                      <b>Datum:</b>{" "}
                      {snapshot.created_at ? new Date(snapshot.created_at).toLocaleString() : "—"}
                    </div>
                    <div className="muted">(Snapshot prikaz ćemo kasnije proširiti.)</div>
                  </div>
                ) : (
                  <div className="muted">Nema snapshot podataka još.</div>
                )}
              </div>

              <div className="card span">
                <div className="cardTitle">Skillovi</div>
                <div className="skills">
                  <Skill label="GK" value={player.skill_gk ?? player.gk ?? "—"} />
                  <Skill label="DEF" value={player.skill_def ?? player.def ?? "—"} />
                  <Skill label="PM" value={player.skill_pm ?? player.pm ?? "—"} />
                  <Skill label="WING" value={player.skill_wing ?? player.wing ?? "—"} />
                  <Skill label="PASS" value={player.skill_pass ?? player.pass ?? "—"} />
                  <Skill label="SCOR" value={player.skill_scor ?? player.scor ?? "—"} />
                  <Skill label="SP" value={player.skill_sp ?? player.sp ?? "—"} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 12px 0;
        }
        .main {
          flex: 1;
          padding: 16px 18px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        h1 {
          margin: 0;
        }
        .sub {
          margin-top: 6px;
          opacity: 0.7;
        }
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ghostBtn {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          text-decoration: none;
          font-weight: 700;
          background: #fff;
          color: #111;
        }
        .card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }
        .span {
          grid-column: 1 / -1;
        }
        .cardTitle {
          font-weight: 900;
          margin-bottom: 10px;
        }
        .rows {
          display: grid;
          gap: 8px;
        }
        .skills {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }
        .snapshot {
          font-size: 13px;
          line-height: 1.6;
        }
        .muted {
          opacity: 0.7;
          font-size: 12px;
          margin-top: 6px;
        }
        .error {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.2);
        }
      `}</style>
    </AppLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">{value}</div>

      <style jsx>{`
        .row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .label {
          opacity: 0.75;
        }
        .value {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function Skill({ label, value }) {
  return (
    <div className="skill">
      <div className="skillLabel">{label}</div>
      <div className="skillValue">{value}</div>

      <style jsx>{`
        .skill {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 14px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.7);
        }
        .skillLabel {
          font-size: 11px;
          opacity: 0.7;
          font-weight: 800;
        }
        .skillValue {
          margin-top: 6px;
          font-size: 18px;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
