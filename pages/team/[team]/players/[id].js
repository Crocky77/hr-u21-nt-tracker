import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../../components/AppLayout";
import { supabase } from "../../../../utils/supabaseClient";

function normalizeTeamParam(teamParam) {
  if (!teamParam) return null;
  const t = String(teamParam).toLowerCase();
  if (t === "u21") return "U21";
  if (t === "nt") return "NT";
  return String(teamParam).toUpperCase();
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const teamType = useMemo(() => normalizeTeamParam(team), [team]);
  const playerId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [player, setPlayer] = useState(null);
  const [lastSnapshot, setLastSnapshot] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!playerId) {
      setErr('Greška: neispravan ID igrača u URL-u.');
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setErr("");

      // 1) dohvat igrača po INTERNOM players.id
      const { data: p, error: pe } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (pe) {
        setErr(pe.message || "Greška kod dohvaćanja igrača.");
        setPlayer(null);
        setLastSnapshot(null);
        setLoading(false);
        return;
      }

      setPlayer(p || null);

      // 2) zadnji snapshot (ako tablica postoji)
      //    (Ako je nema ili nema podataka, ovo neće rušiti stranicu)
      const { data: snaps, error: se } = await supabase
        .from("player_skill_snapshots")
        .select("*")
        .eq("player_id", playerId)
        .order("snapshot_date", { ascending: false })
        .limit(1);

      if (!se && snaps && snaps.length > 0) {
        setLastSnapshot(snaps[0]);
      } else {
        setLastSnapshot(null);
      }

      setLoading(false);
    }

    load();
  }, [router.isReady, playerId]);

  const title = player?.full_name
    ? `Detalji igrača – ${player.full_name}`
    : "Detalji igrača";

  return (
    <AppLayout title={title}>
      <div style={{ marginBottom: 12 }}>
        <Link href={`/team/${String(team || "").toLowerCase()}/players`}>
          ← Povratak na popis
        </Link>
      </div>

      <h1 style={{ marginTop: 0 }}>{title}</h1>

      {loading ? <p>Učitavam...</p> : null}
      {err ? <p style={{ color: "crimson" }}>Greška: {err}</p> : null}

      {!loading && !err && player ? (
        <>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 14,
              maxWidth: 760,
              background: "#fff",
            }}
          >
            <div><b>Tim:</b> {player.team_type || teamType || "—"}</div>
            <div><b>Pozicija:</b> {player.position || "—"}</div>
            <div><b>HT ID:</b> {player.ht_id ? String(player.ht_id) : "—"}</div>
            <div><b>Nacionalnost:</b> {player.nationality || "—"}</div>
            <div><b>Specijalnost:</b> {player.speciality || "—"}</div>
            <div><b>Ozljeda:</b> {player.injury || "—"}</div>
            <div><b>Na transfer listi:</b> {player.on_transfer_list ? "da" : "ne"}</div>
            <div><b>TSI:</b> {player.tsi ?? "—"}</div>
            <div><b>Iskustvo:</b> {player.experience ?? "—"}</div>
            <div><b>Vodstvo:</b> {player.leadership ?? "—"}</div>
            <div><b>Forma:</b> {player.form ?? "—"}</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h2 style={{ marginBottom: 10 }}>Skill snapshot (zadnji)</h2>

            {lastSnapshot ? (
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 14,
                  padding: 14,
                  maxWidth: 760,
                  background: "#fff",
                }}
              >
                <div><b>Snapshot date:</b> {lastSnapshot.snapshot_date || "—"}</div>
                <div><b>Inserted:</b> {lastSnapshot.inserted_at || "—"}</div>
                <div><b>Source:</b> {lastSnapshot.source || "—"}</div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><b>Stamina:</b> {lastSnapshot.stamina ?? "—"}</div>
                  <div><b>Form:</b> {lastSnapshot.form ?? "—"}</div>
                  <div><b>Keeper:</b> {lastSnapshot.gk ?? "—"}</div>
                  <div><b>Defending:</b> {lastSnapshot.defending ?? "—"}</div>
                  <div><b>Playmaking:</b> {lastSnapshot.playmaking ?? "—"}</div>
                  <div><b>Winger:</b> {lastSnapshot.winger ?? "—"}</div>
                  <div><b>Passing:</b> {lastSnapshot.passing ?? "—"}</div>
                  <div><b>Scoring:</b> {lastSnapshot.scoring ?? "—"}</div>
                  <div><b>Set pieces:</b> {lastSnapshot.set_pieces ?? "—"}</div>
                </div>
              </div>
            ) : (
              <p>Nema snapshot podataka za ovog igrača.</p>
            )}
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}
