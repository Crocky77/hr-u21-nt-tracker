import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { supabase } from "../../utils/supabaseClient";

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id, team } = router.query;

  // team je query param: ?team=nt ili ?team=u21
  const safeTeam = useMemo(() => {
    if (team === "nt") return "nt";
    return "u21";
  }, [team]);

  const backHref = useMemo(() => {
    return `/team/${safeTeam}/players`;
  }, [safeTeam]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        // 1) Player
        const { data: p, error: pErr } = await supabase
          .from("players")
          .select(
            `
            id,
            full_name,
            position,
            nationality,
            ht_player_id,
            age_years,
            age_days,
            status,
            last_seen,
            tsi,
            salary,
            skill_goalkeeping,
            skill_defending,
            skill_playmaking,
            skill_winger,
            skill_passing,
            skill_scoring,
            skill_set_pieces
          `
          )
          .eq("id", Number(id))
          .maybeSingle();

        if (pErr) throw pErr;

        // 2) Latest snapshot (ako tablica postoji i radi)
        // Napomena: ne filtriramo po team_slug jer to kod tebe ne postoji (po slikama).
        const { data: s, error: sErr } = await supabase
          .from("player_snapshots")
          .select("*")
          .eq("player_id", Number(id))
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // snapshot je opcionalan — ne rušimo stranicu ako snapshot query faila
        if (sErr) {
          // samo zapamti poruku, ali ne blokiraj UI
          console.warn("Snapshot load error:", sErr.message);
        }

        if (!cancelled) {
          setPlayer(p || null);
          setSnapshot(s || null);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Greška kod učitavanja.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  return (
    <Layout title="Detalji igrača">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <Link href={backHref} style={{ textDecoration: "none" }}>
            ← Igrači
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            Naslovna
          </Link>
          <div style={{ marginLeft: "auto", opacity: 0.7 }}>
            Tim: <b>{safeTeam.toUpperCase()}</b>
          </div>
        </div>

        {loading && <div>Učitavam...</div>}
        {!!err && (
          <div style={{ background: "#ffd7d7", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <b>Greška:</b> {err}
          </div>
        )}

        {!loading && !err && !player && <div>Nema tog igrača (ID: {String(id)})</div>}

        {!loading && !err && player && (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{player.full_name}</div>
            <div style={{ opacity: 0.7, marginBottom: 16 }}>
              ID: <b>{player.id}</b> · HTID: <b>{player.ht_player_id ?? "—"}</b> · Poz:{" "}
              <b>{player.position ?? "—"}</b>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#f6f6f6", borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Osnovno</div>
                <div>Dob: <b>{player.age_years ?? "—"}y {player.age_days ?? "—"}d</b></div>
                <div>Status: <b>{player.status ?? "—"}</b></div>
                <div>Nacionalnost: <b>{player.nationality ?? "—"}</b></div>
                <div>TSI: <b>{player.tsi ?? "—"}</b></div>
                <div>Plaća: <b>{player.salary ?? "—"}</b></div>
                <div>Zadnje viđeno: <b>{player.last_seen ?? "—"}</b></div>
              </div>

              <div style={{ background: "#f6f6f6", borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Snapshot (zadnji)</div>
                {!snapshot && <div style={{ opacity: 0.75 }}>Nema snapshot podataka još.</div>}
                {snapshot && (
                  <div style={{ opacity: 0.9 }}>
                    <div>Forma: <b>{snapshot.form ?? "—"}</b></div>
                    <div>Stamina: <b>{snapshot.stamina ?? "—"}</b></div>
                    <div>Trening: <b>{snapshot.current_training ?? "—"}</b></div>
                    <div>Intenzitet: <b>{snapshot.intensity ?? "—"}</b></div>
                    <div>TSI: <b>{snapshot.tsi ?? "—"}</b></div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14, background: "#f6f6f6", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Skillovi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
                <Skill label="GK" v={player.skill_goalkeeping} />
                <Skill label="DEF" v={player.skill_defending} />
                <Skill label="PM" v={player.skill_playmaking} />
                <Skill label="WING" v={player.skill_winger} />
                <Skill label="PASS" v={player.skill_passing} />
                <Skill label="SCOR" v={player.skill_scoring} />
                <Skill label="SP" v={player.skill_set_pieces} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Skill({ label, v }) {
  return (
    <div style={{ background: "white", borderRadius: 10, padding: 10, textAlign: "center" }}>
      <div style={{ fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 18 }}>{v ?? "—"}</div>
    </div>
  );
}
