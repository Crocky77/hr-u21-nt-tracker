// pages/team/[team]/players/[id].js
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import AppLayout from "../../../../components/AppLayout";
import { supabase } from "../../../../utils/supabaseClient";

import SkillSnapshotBox from "../../../../components/SkillSnapshotBox";
import PlayerTraining from "../../../../components/PlayerTraining";

function safeStr(v) {
  if (v === null || v === undefined) return "—";
  return String(v);
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { team, id } = router.query;

  const teamType = useMemo(() => {
    if (!team) return null;
    return String(team).toUpperCase();
  }, [team]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [player, setPlayer] = useState(null);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [trainingSetting, setTrainingSetting] = useState(null);

  useEffect(() => {
    if (!router.isReady || !teamType || !id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        // PLAYER
        const { data: p, error: pe } = await supabase
          .from("players")
          .select("*")
          .eq("team_type", teamType)
          .eq("id", Number(id))
          .single();

        if (pe) throw pe;

        // SNAPSHOT
        const { data: s, error: se } = await supabase
          .from("player_skill_snapshots")
          .select("*")
          .eq("team_type", teamType)
          .eq("ht_player_id", p.ht_player_id)
          .order("snapshot_date", { ascending: false })
          .limit(1);

        if (se) throw se;

        // TRAINING SETTINGS
        const { data: ts, error: te } = await supabase
          .from("training_settings")
          .select("*")
          .eq("team_type", teamType)
          .eq("position", p.position)
          .limit(1);

        if (te) throw te;

        if (cancelled) return;

        setPlayer(p);
        setLatestSnapshot(s?.[0] || null);
        setTrainingSetting(ts?.[0] || null);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [router.isReady, teamType, id]);

  return (
    <AppLayout title="Detalji igrača">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <Link href={`/team/${team}/players`}>← Povratak na popis</Link>

        <h1>Detalji igrača</h1>

        {loading && <p>Učitavanje…</p>}
        {err && <p style={{ color: "red" }}>Greška: {err}</p>}

        {!loading && player && (
          <>
            <h2>{player.full_name}</h2>

            <div>
              <b>Tim:</b> {safeStr(player.team_type)} <br />
              <b>Pozicija:</b> {safeStr(player.position)} <br />
              <b>HT ID:</b> {safeStr(player.ht_player_id)} <br />
              <b>Dob (HT):</b>{" "}
              {safeStr(player.ht_age_years)} god, {safeStr(player.ht_age_days)} dana <br />
              <b>TSI:</b> {safeStr(player.tsi)} <br />
              <b>Iskustvo:</b> {safeStr(player.experience)} <br />
              <b>Vodstvo:</b> {safeStr(player.leadership)} <br />
              <b>Forma:</b> {safeStr(player.form)} <br />
            </div>

            <SkillSnapshotBox snapshot={latestSnapshot} />

            <PlayerTraining
              player={player}
              trainingSetting={trainingSetting}
              latestSnapshot={latestSnapshot}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
