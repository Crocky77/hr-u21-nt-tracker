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

function val(v) {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

function formatBool(v) {
  if (v === true) return "DA";
  if (v === false) return "NE";
  return "—";
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const teamType = useMemo(() => normalizeTeam(team), [team]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [trainingSetting, setTrainingSetting] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!teamType || !id) return;

    let alive = true;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        // 1) Učitaj igrača (po ID-u iz URL-a)
        const pRes = await supabase
          .from("players")
          .select(
            "id, team_type, position, full_name, ht_player_id, nationality, specialty, injury, transfer_listed, ht_age_years, ht_age_days, tsi, experience, leadership, form, created_at, note"
          )
          .eq("id", Number(id))
          .maybeSingle();

        if (pRes.error) throw pRes.error;
        if (!pRes.data) throw new Error("Igrač nije pronađen (players).");

        // Ako je user ušao npr. /team/nt/... a igrač je U21 (ili obrnuto), nećemo prikazivati krivo
        if (pRes.data.team_type && pRes.data.team_type !== teamType) {
          throw new Error(
            `Igrač je u timu ${pRes.data.team_type}, ali URL je otvoren za ${teamType}.`
          );
        }

        if (!alive) return;
        setPlayer(pRes.data);

        // 2) Zadnji skill snapshot (najnoviji) po HT ID + team_type
        const htId = pRes.data.ht_player_id;

        if (htId) {
          const sRes = await supabase
            .from("player_skill_snapshots")
            .select(
              "id, team_type, ht_player_id, full_name, nationality, specialty, injury, transfer_listed, ht_age_years, ht_age_days, tsi, experience, leadership, form, stamina, gk, defending, playmaking, winger, passing, scoring, set_pieces, caps_nt, caps_u21, rep_flag, category, source, snapshot_date, inserted_at"
            )
            .eq("team_type", teamType)
            .eq("ht_player_id", htId)
            .order("snapshot_date", { ascending: false, nullsFirst: false })
            .order("inserted_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sRes.error) throw sRes.error;

          if (!alive) return;
          setSnapshot(sRes.data || null);
        } else {
          // Nema HT ID: nema snapshot-a
          setSnapshot(null);
        }

        // 3) Training settings za team+poziciju (za preporuku)
        const pos = String(pRes.data.position || "").toUpperCase();
        if (pos) {
          const tRes = await supabase
            .from("training_settings")
            .select("team_type, position, target_skill, min_gain_per_week, max_weeks_without_gain, note")
            .eq("team_type", teamType)
            .eq("position", pos)
            .limit(1)
            .maybeSingle();

          if (tRes.error) throw tRes.error;

          if (!alive) return;
          setTrainingSetting(tRes.data || null);
        } else {
          setTrainingSetting(null);
        }

        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || String(e));
        setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [router.isReady, teamType, id]);

  const title = player?.full_name ? `Detalji igrača — ${player.full_name}` : "Detalji igrača";

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
        <div style={{ marginBottom: 12 }}>
          <Link href={`/team/${String(team || "").toLowerCase()}/players`}>
            ← Povratak na popis
          </Link>
        </div>

        <h1 style={{ marginBottom: 6 }}>Detalji igrača</h1>

        {loading && <p>Učitavam igrača…</p>}
        {err && (
          <div style={{ background: "#ffe9e9", padding: 12, borderRadius: 8 }}>
            <b>Greška:</b> {err}
          </div>
        )}

        {!loading && !err && player && (
          <>
            <h2 style={{ marginTop: 18, marginBottom: 10 }}>{player.full_name}</h2>

            <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
              <div><b>Tim:</b> {val(player.team_type || teamType)}</div>
              <div><b>Pozicija:</b> {val(player.position)}</div>
              <div><b>HT ID:</b> {val(player.ht_player_id)}</div>
              <div><b>Nacionalnost:</b> {val(player.nationality)}</div>
              <div><b>Specijalnost:</b> {val(player.specialty)}</div>
              <div><b>Ozljeda:</b> {val(player.injury)}</div>
              <div><b>Na transfer listi:</b> {formatBool(player.transfer_listed)}</div>
              <div><b>Dob (HT):</b> {val(player.ht_age_years)} god, {val(player.ht_age_days)} dana</div>
              <div><b>TSI:</b> {val(player.tsi)}</div>
              <div><b>Iskustvo:</b> {val(player.experience)}</div>
              <div><b>Vodstvo:</b> {val(player.leadership)}</div>
              <div><b>Forma:</b> {val(player.form)}</div>
            </div>

            <h3 style={{ marginTop: 18 }}>Skill snapshot (zadnji)</h3>

            {!snapshot && (
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                Nema skill snapshot-a za ovog igrača.
              </div>
            )}

            {snapshot && (
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                <div style={{ marginBottom: 10 }}>
                  <div><b>Snapshot date:</b> {val(snapshot.snapshot_date)} </div>
                  <div><b>Inserted:</b> {val(snapshot.inserted_at)}</div>
                  <div><b>Source:</b> {val(snapshot.source)}</div>
                  <div><b>Kategorija:</b> {val(snapshot.category)}</div>
                  <div><b>Reprezentativac:</b> {val(snapshot.rep_flag)}</div>
                  <div><b>Caps NT:</b> {val(snapshot.caps_nt)} | <b>Caps U21:</b> {val(snapshot.caps_u21)}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <div><b>Izdržljivost:</b> {val(snapshot.stamina)}</div>
                  <div><b>Na vratima:</b> {val(snapshot.gk)}</div>
                  <div><b>Obrana:</b> {val(snapshot.defending)}</div>
                  <div><b>Kreiranje:</b> {val(snapshot.playmaking)}</div>
                  <div><b>Krilo:</b> {val(snapshot.winger)}</div>
                  <div><b>Proigravanje:</b> {val(snapshot.passing)}</div>
                  <div><b>Napad:</b> {val(snapshot.scoring)}</div>
                  <div><b>Prekidi:</b> {val(snapshot.set_pieces)}</div>
                  <div><b>Forma:</b> {val(snapshot.form)}</div>
                  <div><b>TSI:</b> {val(snapshot.tsi)}</div>
                  <div><b>Iskustvo:</b> {val(snapshot.experience)}</div>
                  <div><b>Vodstvo:</b> {val(snapshot.leadership)}</div>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 18 }}>Preporuka treninga</h3>
            {!trainingSetting && (
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                Nema postavke u training_settings za ovaj tim/poziciju.
              </div>
            )}

            {trainingSetting && (
              <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
                <div><b>Target skill:</b> {val(trainingSetting.target_skill)}</div>
                <div><b>Min gain/week:</b> {val(trainingSetting.min_gain_per_week)}</div>
                <div><b>Max weeks without gain:</b> {val(trainingSetting.max_weeks_without_gain)}</div>
                <div><b>Napomena:</b> {val(trainingSetting.note)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
