import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function AppLayout({ children, pageTitle }) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [team, setTeam] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        window.location.replace("/login");
        return;
      }
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0 || !urows[0].team_type) {
        setLoading(false);
        setTeam(null);
        return;
      }
      const t = urows[0].team_type;
      setTeam(t);

      // rola per team iz staff_roles
      const { data: srows } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("team_type", t)
        .eq("email", userEmail)
        .limit(1);

      setRole(srows && srows.length > 0 ? srows[0].role : "scout");
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (loading) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
        Učitavam...
      </main>
    );
  }

  if (!team) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: "#b91c1c" }}>Nemaš dodijeljen tim</h1>
        <p>Admin mora postaviti <b>team_type</b> u <b>users</b> tablici (U21 ili NT).</p>
        <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900 }}>
          Odjava
        </button>
      </main>
    );
  }

  const showU21Tools = team === "U21";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ background: "linear-gradient(90deg,#7f1d1d,#ef4444)", color: "#fff", padding: "14px 18px", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center", fontWeight: 900 }}>
              HR
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Hrvatski U21/NT Tracker</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Tim: <b>{team}</b> • {email} ({role})
              </div>
              {pageTitle ? <div style={{ marginTop: 2, fontSize: 12, opacity: 0.9 }}>{pageTitle}</div> : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/" style={navBtnStyle()}>Naslovna</Link>
            <Link href="/dashboard" style={navBtnStyle()}>Dashboard</Link>
            <Link href="/players" style={navBtnStyle()}>Igrači</Link>
            <Link href="/osoblje" style={navBtnStyle()}>Osoblje</Link>

            {showU21Tools ? (
              <Link href="/u21-status" style={navBtnStyle()}>U21 status</Link>
            ) : null}

            <button onClick={logout} style={{ ...navBtnStyle(), background: "#111", borderColor: "#111", cursor: "pointer" }}>
              Odjava
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 18 }}>{children}</div>
    </div>
  );
}

function navBtnStyle() {
  return {
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  };
}
