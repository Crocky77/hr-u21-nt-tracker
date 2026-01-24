import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

function normalizeTeam(team) {
  const t = String(team || "").toLowerCase().trim();
  if (t === "nt") return "nt";
  return "u21";
}

function safeGetLocalStorage(key) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetLocalStorage(key, value) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

export default function PlayerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [teamOverride, setTeamOverride] = useState(null);
  const team = useMemo(
    () => normalizeTeam(teamOverride ?? router.query?.team),
    [teamOverride, router.query?.team]
  );

  // Fallback: ako nema ?team=..., probaj uzeti zadnji tim iz localStorage (sprema se na listi igrača)
  useEffect(() => {
    if (!router.isReady) return;

    const qTeam = router.query?.team;
    if (qTeam) {
      safeSetLocalStorage("last_team", String(qTeam));
      return;
    }

    const last = safeGetLocalStorage("last_team");
    if (last) setTeamOverride(String(last));
  }, [router.isReady, router.query?.team]);

  const backHref = useMemo(() => `/team/${team}/players`, [team]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, team]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // player basic
      const { data: p, error: pErr } = await supabase
        .from("players")
        .select(
          "id, name, ht_player_id, position, age_years, age_days, nationality, tsi, salary, status"
        )
        .eq("id", id)
        .single();

      if (pErr) throw pErr;

      setPlayer(p);

      // latest snapshot (optional)
      const { data: snap, error: sErr } = await supabase
        .from("player_snapshots")
        .select(
          "created_at, gk, def, pm, wing, pass, score, sp, form, stamina, experience, leadership, loyalty"
        )
        .eq("player_id", id)
        .eq("team_type", team)
        .order("created_at", { ascending: false })
        .limit(1);

      // if table/policy missing, do not crash detail page
      if (!sErr && Array.isArray(snap) && snap.length > 0) {
        setSnapshot(snap[0]);
      } else {
        setSnapshot(null);
      }
    } catch (e) {
      setError(e?.message || "Greška pri dohvaćanju detalja igrača.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
      <style jsx global>{`
        .hr-card {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 14px;
          background: white;
          padding: 14px;
        }
        .hr-backBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: white;
          text-decoration: none;
          color: inherit;
          font-weight: 700;
          font-size: 13px;
        }
        .hr-kv {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 8px;
          font-size: 13px;
        }
        .hr-kv .k {
          opacity: 0.7;
        }
        .hr-kv .v {
          font-weight: 700;
        }
        .hr-skillGrid {
          display: grid;
          grid-template-columns: repeat(7, minmax(70px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .hr-skillBox {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 10px;
          text-align: center;
          background: rgba(0, 0, 0, 0.02);
        }
        .hr-skillBox .lab {
          font-size: 11px;
          opacity: 0.7;
        }
        .hr-skillBox .val {
          font-size: 16px;
          font-weight: 900;
          margin-top: 2px;
        }
      `}</style>

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 2 }}>
            {player?.name || "Detalji igrača"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3 }}>
            Tim: <b>{team.toUpperCase()}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="hr-backBtn" href={backHref}>
            ← Igrači
          </Link>
          <Link className="hr-backBtn" href={`/team/${team}`}>
            Modul
          </Link>
          <Link className="hr-backBtn" href="/">
            Naslovna
          </Link>
        </div>
      </div>

      {error ? (
        <div
          style={{
            border: "1px solid rgba(255,0,0,0.25)",
            background: "rgba(255,0,0,0.06)",
            padding: 10,
            borderRadius: 10,
            marginTop: 12,
            fontSize: 13,
          }}
        >
          Greška: {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>Učitavam...</div>
      ) : !player ? (
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Nema podataka za igrača.
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="hr-card">
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Osnovno</div>
            <div className="hr-kv">
              <div className="k">Interni ID</div>
              <div className="v">{player.id}</div>

              <div className="k">HT Player ID</div>
              <div className="v">{player.ht_player_id || "—"}</div>

              <div className="k">Pozicija</div>
              <div className="v">{player.position || "—"}</div>

              <div className="k">Dob</div>
              <div className="v">
                {player.age_years != null ? `${player.age_years}y ${player.age_days || 0}d` : "—"}
              </div>

              <div className="k">Status</div>
              <div className="v">{player.status || "—"}</div>

              <div className="k">Nacionalnost</div>
              <div className="v">{player.nationality || "—"}</div>

              <div className="k">TSI</div>
              <div className="v">{player.tsi != null ? String(player.tsi) : "—"}</div>

              <div className="k">Plaća</div>
              <div className="v">{player.salary != null ? String(player.salary) : "—"}</div>
            </div>

            <div style={{ marginTop: 14, fontSize: 14, fontWeight: 900 }}>Skillovi</div>
            <div className="hr-skillGrid">
              <div className="hr-skillBox">
                <div className="lab">GK</div>
                <div className="val">{snapshot?.gk ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">DEF</div>
                <div className="val">{snapshot?.def ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">PM</div>
                <div className="val">{snapshot?.pm ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">WING</div>
                <div className="val">{snapshot?.wing ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">PASS</div>
                <div className="val">{snapshot?.pass ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">SCOR</div>
                <div className="val">{snapshot?.score ?? "—"}</div>
              </div>
              <div className="hr-skillBox">
                <div className="lab">SP</div>
                <div className="val">{snapshot?.sp ?? "—"}</div>
              </div>
            </div>
          </div>

          <div className="hr-card">
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>
              Snapshot (zadnji)
            </div>

            {snapshot ? (
              <div className="hr-kv">
                <div className="k">Datum</div>
                <div className="v">
                  {snapshot.created_at ? new Date(snapshot.created_at).toLocaleString() : "—"}
                </div>

                <div className="k">Forma</div>
                <div className="v">{snapshot.form ?? "—"}</div>

                <div className="k">Stamina</div>
                <div className="v">{snapshot.stamina ?? "—"}</div>

                <div className="k">Experience</div>
                <div className="v">{snapshot.experience ?? "—"}</div>

                <div className="k">Leadership</div>
                <div className="v">{snapshot.leadership ?? "—"}</div>

                <div className="k">Loyalty</div>
                <div className="v">{snapshot.loyalty ?? "—"}</div>
              </div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.7 }}>Nema snapshot podataka još.</div>
            )}

            <div style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
              * Ako snapshot tablica/policy nije dostupna, detalji igrača i dalje rade (samo bez snapshot-a).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
