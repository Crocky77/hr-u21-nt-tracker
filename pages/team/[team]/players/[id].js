// pages/team/[team]/players/[id].js
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import AppLayout from "../../../AppLayout";
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
    // očekujemo /team/nt/... ili /team/u21/...
    if (!team) return null;
    const t = String(team).toUpperCase();
    if (t === "NT" || t === "U21") return t;
    // fallback
    return t;
  }, [team]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [player, setPlayer] = useState(null);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [trainingSetting, setTrainingSetting] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!teamType || !id) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        // 1) player
        const { data: p, error: pe } = await supabase
          .from("players")
          .select(
            [
              "id",
              "team_type",
              "position",
              "status",
              "country_id",
              "full_name",
              "ht_player_id",
              "notes",
              "last_seen_at",
              "dob",
              "ht_age_years",
              "ht_age_days",
              "training_type",
              "trainer_level",
              "assistants",
              "intensity",
              "stamina_share",
              "ideal_training_score",
              "actual_training_score",
              "nationality",
              "specialty",
              "injury",
              "transfer_listed",
              "age_years",
              "age_days",
              "tsi",
              "experience",
              "leadership",
              "form",
              "stamina",
              "keeper",
              "defending",
              "playmaking",
              "wing",
              "passing",
              "scoring",
              "set_pieces",
              "caps_nt",
              "caps_u21",
              "is_international",
              "category",
              "source",
              "imported_at",
              "note",
            ].join(",")
          )
          .eq("team_type", teamType)
          .eq("id", Number(id))
          .maybeSingle();

        if (pe) throw pe;
        if (!p) throw new Error("Igrač nije pronađen.");

        // 2) latest snapshot (player_skill_snapshots)
        // U tvojoj tablici postoji ht_player_id i team_type — to koristimo.
        const { data: s, error: se } = await supabase
          .from("player_skill_snapshots")
          .select(
            [
              "id",
              "team_type",
              "ht_player_id",
              "full_name",
              "nationality",
              "specialty",
              "injury",
              "transfer_listed",
              "ht_age_years",
              "ht_age_days",
              "tsi",
              "experience",
              "leadership",
              "form",
              "stamina",
              "gk",
              "defending",
              "playmaking",
              "winger",
              "passing",
              "scoring",
              "set_pieces",
              "caps_nt",
              "caps_u21",
              "is_international",
              "category",
              "source",
              "snapshot_date",
              "inserted_at",
            ].join(",")
          )
          .eq("team_type", teamType)
          .eq("ht_player_id", p.ht_player_id)
          .order("snapshot_date", { ascending: false })
          .order("inserted_at", { ascending: false })
          .limit(1);

        if (se) throw se;

        const latest = Array.isArray(s) && s.length > 0 ? s[0] : null;

        // 3) training setting for team_type + position
        const { data: ts, error: te } = await supabase
          .from("training_settings")
          .select("id, team_type, position, target_skill, min_gain_per_week, max_weeks_without_gain, note")
          .eq("team_type", teamType)
          .eq("position", p.position)
          .order("id", { ascending: true })
          .limit(1);

        if (te) throw te;

        const setting = Array.isArray(ts) && ts.length > 0 ? ts[0] : null;

        if (cancelled) return;
        setPlayer(p);
        setLatestSnapshot(latest);
        setTrainingSetting(setting);
      } catch (e) {
        if (cancelled) return;
        setErr(e?.message || String(e));
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, teamType, id]);

  const title = player?.full_name ? `Detalji igrača - ${player.full_name}` : "Detalji igrača";

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ marginBottom: 16 }}>
          <Link href={`/team/${String(team || "").toLowerCase()}/players`}>
            ← Povratak na popis
          </Link>
        </div>

        <h1 style={{ marginTop: 0 }}>Detalji igrača</h1>

        {loading ? <div>Učitavanje...</div> : null}

        {err ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #f5c2c7",
              borderRadius: 8,
              background: "#f8d7da",
              color: "#842029",
            }}
          >
            Greška: {err}
          </div>
        ) : null}

        {!loading && !err && player ? (
          <>
            <h2 style={{ marginBottom: 8 }}>{player.full_name}</h2>

            <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
              <div>
                <b>Tim:</b> {safeStr(player.team_type)}
              </div>
              <div>
                <b>Pozicija:</b> {safeStr(player.position)}
              </div>
              <div>
                <b>Status:</b> {safeStr(player.status)}
              </div>
              <div>
                <b>HT ID:</b> {safeStr(player.ht_player_id)}
              </div>

              <div style={{ marginTop: 8 }}>
                <b>Nacionalnost:</b> {safeStr(player.nationality)}
              </div>
              <div>
                <b>Specijalnost:</b> {safeStr(player.specialty)}
              </div>
              <div>
                <b>Ozljeda:</b> {safeStr(player.injury)}
              </div>
              <div>
                <b>Na transfer listi:</b>{" "}
                {player.transfer_listed === null || player.transfer_listed === undefined
                  ? "—"
                  : player.transfer_listed
                  ? "DA"
                  : "NE"}
              </div>

              <div style={{ marginTop: 8 }}>
                <b>Dob (HT):</b> {safeStr(player.ht_age_years)} god, {safeStr(player.ht_age_days)} dana
              </div>
              <div>
                <b>TSI:</b> {safeStr(player.tsi)}
              </div>
              <div>
                <b>Iskustvo:</b> {safeStr(player.experience)}
              </div>
              <div>
                <b>Vodstvo:</b> {safeStr(player.leadership)}
              </div>
              <div>
                <b>Forma:</b> {safeStr(player.form)}
              </div>

              <div style={{ marginTop: 8 }}>
                <b>Bilješke:</b> {safeStr(player.notes)}
              </div>
            </div>

            <SkillSnapshotBox snapshot={latestSnapshot} />

            <PlayerTraining player={player} trainingSetting={trainingSetting} latestSnapshot={latestSnapshot} />
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
