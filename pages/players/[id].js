import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #eee" }}>
      <div style={{ opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value ?? "—"}</div>
    </div>
  );
}

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { id, team } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function run() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message || "Greška kod dohvaćanja igrača.");
        setPlayer(null);
        setLoading(false);
        return;
      }

      setPlayer(data);
      setLoading(false);
    }

    run();
  }, [id]);

  const backHref = team ? `/team/${team}/players` : "/";

  const fullName = player?.full_name ?? player?.name ?? "—";
  const htId = player?.ht_id ?? player?.ht_player_id ?? "—";
  const pos = player?.position ?? player?.pos ?? "—";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href={backHref}>← Igrači</Link>
          <Link href="/">Naslovna</Link>
        </div>

        <div style={{ opacity: 0.75 }}>
          Tim: <b>{team ? String(team).toUpperCase() : "—"}</b>
        </div>
      </div>

      <h1 style={{ marginTop: 14 }}>{fullName}</h1>

      {loading && <p>Učitavanje...</p>}

      {!loading && error && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f2b8b5", background: "#fff3f2" }}>
          <b>Greška:</b> {error}
        </div>
      )}

      {!loading && !error && player && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Osnovno</h3>
            <Row label="Interni ID" value={player.id} />
            <Row label="HT Player ID" value={htId} />
            <Row label="Pozicija" value={pos} />
            <Row label="Dob" value={player.age ?? player.age_years ?? "—"} />
            <Row label="Status" value={player.status ?? "—"} />
            <Row label="Nacionalnost" value={player.nationality ?? "Hrvatska"} />
            <Row label="TSI" value={player.tsi ?? "—"} />
            <Row label="Plaća" value={player.salary ?? player.wage ?? "—"} />
          </div>

          <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Snapshot (zadnji)</h3>
            <p style={{ opacity: 0.75, marginTop: 0 }}>
              (Ovo ćemo spojiti kasnije kad riješimo snapshot tablice / RPC)
            </p>
            <div style={{ opacity: 0.75 }}>Nema snapshot podataka još.</div>
          </div>

          <div style={{ gridColumn: "1 / -1", border: "1px solid #e6e6e6", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Skillovi</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(80px, 1fr))", gap: 10 }}>
              <Skill label="GK" value={player.skill_gk ?? player.gk} />
              <Skill label="DEF" value={player.skill_def ?? player.def} />
              <Skill label="PM" value={player.skill_pm ?? player.pm} />
              <Skill label="WING" value={player.skill_wing ?? player.wing} />
              <Skill label="PASS" value={player.skill_pass ?? player.pass} />
              <Skill label="SCOR" value={player.skill_sc ?? player.sc} />
              <Skill label="SP" value={player.skill_sp ?? player.sp} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Skill({ label, value }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value ?? "—"}</div>
    </div>
  );
}
