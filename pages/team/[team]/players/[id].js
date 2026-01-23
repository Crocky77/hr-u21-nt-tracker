import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import supabase from "../../../../lib/supabaseClient";

export default function PlayerDetail() {
  const router = useRouter();
  const { team, id } = router.query;

  const [teamName, setTeamName] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!team || !id) return;
    loadPlayer().catch((e) => {
      console.error(e);
      setErrMsg("Greška kod učitavanja igrača.");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, id]);

  async function loadPlayer() {
    setLoading(true);
    setErrMsg("");
    setPlayer(null);

    // 1) Team by slug
    const { data: teamRow, error: teamErr } = await supabase
      .from("teams")
      .select("id,name,slug")
      .eq("slug", team)
      .maybeSingle();

    if (teamErr) {
      setErrMsg("Greška kod učitavanja tima.");
      setLoading(false);
      return;
    }
    if (!teamRow) {
      setErrMsg("Tim nije pronađen.");
      setLoading(false);
      return;
    }

    setTeamName(teamRow.name || teamRow.slug);

    // 2) Player lookup
    // U listi igrača u URL-u najčešće šaljemo HT player id (npr. 469897495),
    // ali u bazi postoji i interni players.id.
    // Zato tražimo po OBA: players.id i players.ht_player_id.
    const pid = Number(id);
    if (!Number.isFinite(pid)) {
      setErrMsg("Igrač nije pronađen (neispravan ID).");
      setLoading(false);
      return;
    }

    const { data: pRows, error: pErr } = await supabase
      .from("players")
      .select(
        `
        id,
        ht_player_id,
        team_id,
        full_name,
        age_years,
        age_days,
        position,
        salary,
        tsi,
        specialty,
        experience,
        form,
        stamina,
        htms,
        htms28,
        skill_gk,
        skill_def,
        skill_pm,
        skill_wing,
        skill_pass,
        skill_score,
        skill_sp
      `
      )
      .eq("team_id", teamRow.id)
      .or(`id.eq.${pid},ht_player_id.eq.${pid}`)
      .limit(1);

    if (pErr) {
      setErrMsg("Greška kod učitavanja igrača.");
      setLoading(false);
      return;
    }

    const found = (pRows && pRows.length > 0) ? pRows[0] : null;

    if (!found) {
      setErrMsg("Igrač nije pronađen (krivi ID ili ne pripada ovom timu).");
      setLoading(false);
      return;
    }

    setPlayer(found);
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="topbar">
        <h1>Detalji igrača</h1>
        <div className="links">
          <Link href={`/team/${team}/players`}>← Natrag na igrače</Link>
          <Link href={`/team/${team}`}>Moduli</Link>
          <Link href={`/`}>Naslovnica</Link>
        </div>
      </div>

      <div className="subtitle">Tim: {teamName || "-"}</div>

      {loading && <div className="card">Učitavanje...</div>}

      {!loading && errMsg && (
        <div className="card error">
          {errMsg}
        </div>
      )}

      {!loading && player && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{player.full_name}</h2>

          <div className="grid">
            <div>
              <b>HT ID</b>: {player.ht_player_id ?? "-"}
            </div>
            <div>
              <b>Dob</b>: {player.age_years ?? "-"} ({player.age_days ?? "-"}d)
            </div>
            <div>
              <b>Poz</b>: {player.position ?? "-"}
            </div>
            <div>
              <b>TSI</b>: {player.tsi ?? "-"}
            </div>
            <div>
              <b>Plaća</b>: {player.salary ?? "-"}
            </div>
            <div>
              <b>Spec</b>: {player.specialty ?? "-"}
            </div>
            <div>
              <b>Forma</b>: {player.form ?? "-"}
            </div>
            <div>
              <b>Stamina</b>: {player.stamina ?? "-"}
            </div>
            <div>
              <b>Experience</b>: {player.experience ?? "-"}
            </div>
            <div>
              <b>HTMS</b>: {player.htms ?? "-"}
            </div>
            <div>
              <b>HTMS28</b>: {player.htms28 ?? "-"}
            </div>
          </div>

          <hr />

          <h3>Skills</h3>
          <div className="grid">
            <div><b>GK</b>: {player.skill_gk ?? "-"}</div>
            <div><b>DEF</b>: {player.skill_def ?? "-"}</div>
            <div><b>PM</b>: {player.skill_pm ?? "-"}</div>
            <div><b>WG</b>: {player.skill_wing ?? "-"}</div>
            <div><b>PS</b>: {player.skill_pass ?? "-"}</div>
            <div><b>SC</b>: {player.skill_score ?? "-"}</div>
            <div><b>SP</b>: {player.skill_sp ?? "-"}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page { padding: 18px; max-width: 1050px; margin: 0 auto; }
        .topbar { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .links { display: flex; gap: 14px; }
        .subtitle { margin: 8px 0 14px; opacity: 0.8; }
        .card { background: #fff; border: 1px solid #e7e7e7; border-radius: 12px; padding: 14px; }
        .error { border-color: #ffb4b4; background: #fff5f5; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
        hr { border: 0; border-top: 1px solid #eee; margin: 14px 0; }
      `}</style>
    </div>
  );
}
