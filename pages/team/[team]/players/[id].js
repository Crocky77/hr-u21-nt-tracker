// pages/team/[team]/players/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AppLayout from "../../../../components/AppLayout";
import { supabase } from "../../../../utils/supabaseClient";

function teamLabel(team) {
  return team === "u21" ? "U21 Hrvatska" : "NT Hrvatska";
}
function teamTypeDB(team) {
  return team === "u21" ? "U21" : "NT";
}

export default function PlayerDetails() {
  const router = useRouter();
  const team = (router.query.team || "").toString().toLowerCase();
  const id = router.query.id ? Number(router.query.id) : null;

  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userTeamType, setUserTeamType] = useState(null);

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role || "");
      setUserTeamType(urows[0].team_type || null);
      setAccess("ok");
    })();
  }, []);

  // team access check
  useEffect(() => {
    if (access !== "ok") return;
    if (!team || (team !== "u21" && team !== "nt")) return;

    const wanted = teamTypeDB(team);
    if (role !== "admin") {
      if (!userTeamType || userTeamType !== wanted) {
        router.replace("/");
      }
    }
  }, [access, team, role, userTeamType, router]);

  async function fetchPlayer() {
    if (!id) return;
    if (!team || (team !== "u21" && team !== "nt")) return;

    setLoading(true);
    const wanted = teamTypeDB(team);

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .eq("team_type", wanted)
      .limit(1);

    if (error) {
      alert("Greška: " + error.message);
      setRow(null);
    } else {
      setRow(data && data.length ? data[0] : null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (access === "ok") fetchPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, team, id]);

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid #e5e7eb" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Detalji igrača</h1>
          <p><strong>Nemaš pristup.</strong></p>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading" || !team) {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Hrvatski U21/NT Tracker" team={team} teamLabel={teamLabel(team)} email={email} role={role}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Detalji igrača</h1>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            <Link href={`/team/${team}/players`} style={{ fontWeight: 900, textDecoration: "none" }}>
              ← Povratak na popis
            </Link>
          </div>
        </div>

        <button
          onClick={fetchPlayer}
          style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Osvježi
        </button>
      </div>

      <div style={{ marginTop: 14, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18 }}>
        {loading ? (
          <div>Učitavam...</div>
        ) : !row ? (
          <div style={{ opacity: 0.75 }}>Igrač nije pronađen (ili nije u ovom timu).</div>
        ) : (
          <>
            <div style={{ fontSize: 24, fontWeight: 1100 }}>{row.full_name}</div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><strong>Team:</strong> {row.team_type}</div>
              <div><strong>Pozicija:</strong> {row.position || "—"}</div>
              <div><strong>HT ID:</strong> {row.ht_player_id || "—"}</div>
              <div><strong>DOB:</strong> {row.date_of_birth || row.dob || "—"}</div>
              <div><strong>HT dob:</strong> {(row.ht_age_years != null && row.ht_age_days != null) ? `${row.ht_age_years}g (${row.ht_age_days}d)` : "—"}</div>
              <div><strong>Status:</strong> {row.status || "—"}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 6 }}>Bilješke</div>
              <div style={{ whiteSpace: "pre-wrap", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12 }}>
                {row.notes || "—"}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                (V1) U ovoj fazi samo admin mijenja bilješke u listi igrača. Kasnije ide bilješke po skautu.
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
