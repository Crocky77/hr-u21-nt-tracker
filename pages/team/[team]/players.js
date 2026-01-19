import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../../../utils/supabaseClient";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function isAuthError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return msg.includes("not authenticated") || msg.includes("jwt") || msg.includes("auth");
}

function fmt(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const label = useMemo(() => teamLabel(team), [team]);

  const [teamId, setTeamId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // resolve teamId
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!team) return;
      setErrMsg("");
      setTeamId(null);

      const { data, error } = await supabase
        .from("teams")
        .select("id, slug")
        .eq("slug", team)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setErrMsg(`Ne mogu dohvatiti team_id za "${team}". (${error.message})`);
        return;
      }
      if (!data?.id) {
        setErrMsg(`Ne postoji tim za slug "${team}". Provjeri tablicu teams.`);
        return;
      }

      setTeamId(data.id);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [team]);

  // load player
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!teamId || !id) return;

      setLoading(true);
      setErrMsg("");
      setPlayer(null);

      const { data, error } = await supabase
        .from("players")
        .select(
          `
          id,
          team_id,
          ht_player_id,
          full_name,
          age,
          position,
          nationality,
          tsi,
          wage,
          form,
          stamina,
          stamina_pct,
          training_last,
          training_now,
          skill_gk,
          skill_def,
          skill_pm,
          skill_wing,
          skill_pass,
          skill_score,
          skill_sp,
          created_at,
          updated_at
        `
        )
        .eq("id", id)
        .eq("team_id", teamId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        if (isAuthError(error)) {
          setErrMsg(
            "Zaključano bez prijave. (Auth nije spojen u UI još). Kad spojimo login, ovo će se automatski otvoriti."
          );
          setLoading(false);
          return;
        }
        setErrMsg(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrMsg("Igrač nije pronađen (krivi ID ili ne pripada ovom timu).");
        setLoading(false);
        return;
      }

      setPlayer(data);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [teamId, id]);

  if (!team || !id) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Detalji igrača</h1>
            <div className="hr-pageSub">
              Tim: {label} {player?.full_name ? `· ${player.full_name}` : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={`/team/${team}/players`}>
              ← Natrag na igrače
            </Link>
            <Link className="hr-backBtn" href={`/team/${team}`}>
              Moduli
            </Link>
            <Link className="hr-backBtn" href="/">
              Naslovnica
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {errMsg ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(220,38,38,0.06)",
              color: "rgba(127,29,29,0.95)",
              fontWeight: 900,
            }}
          >
            {errMsg}
          </div>
        ) : null}

        {/* LOADING */}
        {loading ? (
          <div style={{ marginTop: 14, opacity: 0.75, fontWeight: 900 }}>Učitavam...</div>
        ) : null}

        {/* CONTENT */}
        {!loading && player ? (
          <>
            {/* TOP INFO */}
            <div
              className="hr-3dCard"
              style={{
                marginTop: 14,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <div className="hr-3dCardInner">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 1000 }}>{player.full_name}</div>
                    <div style={{ marginTop: 6, opacity: 0.8, fontWeight: 800 }}>
                      Pozicija: {fmt(player.position)} · Dob: {fmt(player.age)} · Nacija:{" "}
                      {fmt(player.nationality)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {player.ht_player_id ? (
                      <a
                        className="hr-backBtn"
                        href={`https://www.hattrick.org/Club/Players/Player.aspx?playerId=${player.ht_player_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Otvori na Hattricku →
                      </a>
                    ) : (
                      <span style={{ fontWeight: 900, opacity: 0.7 }}>Nema HT ID</span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>HT ID: {fmt(player.ht_player_id)}</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>TSI: {fmt(player.tsi)}</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>Plaća: {fmt(player.wage)}</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>Forma: {fmt(player.form)}</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>
                    Stamina: {fmt(player.stamina)} ({fmt(player.stamina_pct)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Skillovi</div>

              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.85)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    padding: "10px 12px",
                    fontWeight: 1000,
                    background: "rgba(0,0,0,0.04)",
                    minWidth: 820,
                  }}
                >
                  <div>GK</div>
                  <div>DEF</div>
                  <div>PM</div>
                  <div>WING</div>
                  <div>PASS</div>
                  <div>SCOR</div>
                  <div>SP</div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    padding: "12px",
                    fontWeight: 900,
                    minWidth: 820,
                  }}
                >
                  <div>{fmt(player.skill_gk)}</div>
                  <div>{fmt(player.skill_def)}</div>
                  <div>{fmt(player.skill_pm)}</div>
                  <div>{fmt(player.skill_wing)}</div>
                  <div>{fmt(player.skill_pass)}</div>
                  <div>{fmt(player.skill_score)}</div>
                  <div>{fmt(player.skill_sp)}</div>
                </div>
              </div>
            </div>

            {/* TRAINING */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Trening</div>

              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.85)",
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, opacity: 0.8 }}>Zadnji trening: {fmt(player.training_last)}</div>
                  <div style={{ fontWeight: 900, opacity: 0.8 }}>Trenutni trening: {fmt(player.training_now)}</div>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                  Napomena: kasnije ovdje dodajemo “povijest treninga”, “50%/0% trening alert”, i automatsku provjeru.
                </div>
              </div>
            </div>

            {/* RECOMMENDED TRAINING / NOTES (skeleton) */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Preporučeni trening & bilješke (skeleton)</div>

              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.85)",
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 900, opacity: 0.8 }}>
                  Ovo ćemo spojiti na DB tablice (recommendations / notes) i role (izbornik/skaut/pomoćnik).
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <input
                    disabled
                    placeholder="Preporučeni trening (dolazi)"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: "rgba(0,0,0,0.03)",
                      fontWeight: 900,
                    }}
                  />

                  <textarea
                    disabled
                    placeholder="Bilješka (dolazi)"
                    rows={4}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: "rgba(0,0,0,0.03)",
                      fontWeight: 800,
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* META */}
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
              DB meta: created_at={fmt(player.created_at)} · updated_at={fmt(player.updated_at)}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
              }
