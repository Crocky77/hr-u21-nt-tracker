import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const teamType = normalizeTeam(team);

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !teamType) return;

    async function load() {
      setLoading(true);
      setError(null);

      // 1️⃣ UČITAJ IGRAČA
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .eq("team_type", teamType)
        .single();

      if (playerError || !playerData) {
        setError("Igrač nije pronađen.");
        setLoading(false);
        return;
      }

      setPlayer(playerData);

      // 2️⃣ UČITAJ ZADNJI SKILL SNAPSHOT
      if (playerData.ht_player_id) {
        const { data: skillData } = await supabase
          .from("player_skill_snapshots")
          .select(`
            stamina,
            gk,
            defending,
            playmaking,
            winger,
            passing,
            scoring,
            set_pieces,
            tsi,
            experience,
            leadership,
            form,
            caps_nt,
            caps_u21,
            category,
            snapshot_date
          `)
          .eq("ht_player_id", playerData.ht_player_id)
          .eq("team_type", teamType)
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .single();

        setSkills(skillData || null);
      }

      setLoading(false);
    }

    load();
  }, [id, teamType]);

  return (
    <AppLayout title="Detalji igrača">
      <div className="page">
        <Link href={`/team/${team}/players`}>
          ← Povratak na popis
        </Link>

        {loading && <p>Učitavam igrača…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {player && (
          <>
            <h1>{player.full_name}</h1>

            <div className="card">
              <p><strong>Tim:</strong> {teamType}</p>
              <p><strong>Pozicija:</strong> {val(player.position)}</p>
              <p><strong>Status:</strong> {val(player.status)}</p>
              <p><strong>HT ID:</strong> {val(player.ht_player_id)}</p>
              <p><strong>Bilješke:</strong> {val(player.notes)}</p>
            </div>

            {/* SKILOVI */}
            {skills ? (
              <div className="card">
                <h3>Skilovi (zadnji snapshot)</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>Forma: {val(skills.form)}</div>
                  <div>Izdržljivost: {val(skills.stamina)}</div>
                  <div>GK: {val(skills.gk)}</div>
                  <div>Obrana: {val(skills.defending)}</div>
                  <div>Kreiranje: {val(skills.playmaking)}</div>
                  <div>Krilo: {val(skills.winger)}</div>
                  <div>Proigravanje: {val(skills.passing)}</div>
                  <div>Napad: {val(skills.scoring)}</div>
                  <div>Prekidi: {val(skills.set_pieces)}</div>
                  <div>TSI: {val(skills.tsi)}</div>
                  <div>Iskustvo: {val(skills.experience)}</div>
                  <div>Vodstvo: {val(skills.leadership)}</div>
                  <div>NT nastupi: {val(skills.caps_nt)}</div>
                  <div>U21 nastupi: {val(skills.caps_u21)}</div>
                  <div>Kategorija: {val(skills.category)}</div>
                </div>

                <small>Snapshot: {skills.snapshot_date}</small>
              </div>
            ) : (
              <div className="card">
                <p>Nema skill snapshot-a za ovog igrača.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
