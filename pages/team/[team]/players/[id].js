// pages/team/[team]/players/[id].js
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

function safe(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
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
      setErr("Greška: neispravan ID igrača u URL-u.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      // 1) Dohvati igrača po internom players.id
      const { data: p, error: pe } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (cancelled) return;

      if (pe) {
        setErr(pe.message || "Greška kod dohvaćanja igrača.");
        setPlayer(null);
        setLastSnapshot(null);
        setLoading(false);
        return;
      }

      setPlayer(p || null);

      // 2) Zadnji snapshot (ako postoji)
      const { data: snaps, error: se } = await supabase
        .from("player_skill_snapshots")
        .select("*")
        .eq("player_id", playerId)
        .order("snapshot_date", { ascending: false })
        .order("inserted_at", { ascending: false })
        .limit(1);

      if (!cancelled) {
        if (!se && snaps && snaps.length > 0) setLastSnapshot(snaps[0]);
        else setLastSnapshot(null);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, playerId]);

  const title = player?.full_name ? `Detalji – ${player.full_name}` : "Detalji igrača";

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                background: "#fff",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><b>Tim:</b> {safe(player.team_type || teamType)}</div>
                <div><b>Pozicija:</b> {safe(player.position)}</div>

                {/* ✅ STANDARD: ht_player_id */}
                <div><b>HT ID:</b> {player.ht_player_id ? String(player.ht_player_id) : "—"}</div>

                <div><b>Nacionalnost:</b> {safe(player.nationality)}</div>

                <div><b>Specijalnost:</b> {safe(player.speciality || player.specialty)}</div>
                <div><b>Ozljeda:</b> {safe(player.injury)}</div>

                <div><b>Transfer:</b> {player.on_transfer_list ? "da" : "ne"}</div>
                <div><b>Kategorija:</b> {safe(player.category)}</div>

                <div><b>TSI:</b> {safe(player.tsi)}</div>
                <div><b>Iskustvo:</b> {safe(player.experience)}</div>

                <div><b>Vodstvo:</b> {safe(player.leadership)}</div>
                <div><b>Forma:</b> {safe(player.form)}</div>

                <div><b>Izdržljivost:</b> {safe(player.stamina)}</div>
                <div><b>Napomena:</b> {safe(player.notes)}</div>
              </div>
            </div>

            <h2 style={{ marginTop: 0 }}>Skill snapshot (zadnji)</h2>

            {lastSnapshot ? (
              <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14, background: "#fff" }}>
                <div><b>Snapshot date:</b> {safe(lastSnapshot.snapshot_date)}</div>
                <div><b>Inserted:</b> {safe(lastSnapshot.inserted_at)}</div>
                <div><b>Source:</b> {safe(lastSnapshot.source)}</div>

                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><b>Stamina:</b> {safe(lastSnapshot.stamina)}</div>
                  <div><b>Form:</b> {safe(lastSnapshot.form)}</div>

                  <div><b>Keeper:</b> {safe(lastSnapshot.gk)}</div>
                  <div><b>Defending:</b> {safe(lastSnapshot.defending)}</div>

                  <div><b>Playmaking:</b> {safe(lastSnapshot.playmaking)}</div>
                  <div><b>Winger:</b> {safe(lastSnapshot.winger)}</div>

                  <div><b>Passing:</b> {safe(lastSnapshot.passing)}</div>
                  <div><b>Scoring:</b> {safe(lastSnapshot.scoring)}</div>

                  <div><b>Set pieces:</b> {safe(lastSnapshot.set_pieces)}</div>
                </div>
              </div>
            ) : (
              <p>Nema snapshot podataka za ovog igrača.</p>
            )}
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
