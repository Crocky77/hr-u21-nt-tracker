import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AppLayout({
  title = "Hrvatski U21/NT Tracker",
  subtitle = "Selektorski panel • Scouting • U21/NT",
  activeTeamLabel = null, // npr "U21 Hrvatska" ili "NT Hrvatska"
  children,
}) {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null); // "U21" | "NT" | null

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) return;

      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (urows && urows.length > 0) {
        setRole(urows[0].role || null);
        setTeamType(urows[0].team_type || null);
      }
    })();
  }, []);

  const teamPill = useMemo(() => {
    if (activeTeamLabel) return activeTeamLabel;
    if (teamType === "U21") return "U21 Hrvatska";
    if (teamType === "NT") return "NT Hrvatska";
    return null;
  }, [activeTeamLabel, teamType]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.topInner}>
          {/* Brand */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={styles.badgeHR}>HR</div>
            <div>
              <div style={styles.title}>{title}</div>
              <div style={styles.subTitle}>{subtitle}</div>
              {teamPill ? (
                <div style={{ marginTop: 6, display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <span style={styles.pill}>{teamPill}</span>
                  {role ? <span style={{ ...styles.pill, background: "rgba(255,255,255,0.14)" }}>{role}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Nav */}
          <div style={styles.navWrap}>
            {/* Internal app links */}
            <Link href="/" style={styles.navBtn}>
              Naslovna
            </Link>
            <Link href="/dashboard" style={styles.navBtn}>
              Dashboard
            </Link>
            <Link href="/players" style={styles.navBtn}>
              Igrači
            </Link>

            {/* Portal links */}
            <Link href="/about" style={styles.navBtnSoft}>
              O alatu
            </Link>
            <Link href="/help" style={styles.navBtnSoft}>
              Pomoć
            </Link>
            <Link href="/donate" style={styles.navBtnSoft}>
              Donacije
            </Link>

            {/* User + logout */}
            <div style={styles.userBox}>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {email ? (
                  <>
                    Dobrodošli, <b>{email}</b>
                  </>
                ) : (
                  <>Ulogiran</>
                )}
              </div>
              <button onClick={logout} style={styles.logoutBtn}>
                Odjava
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>{children}</div>
    </main>
  );
}

const styles = {
  topBar: {
    background: "linear-gradient(90deg,#7f1d1d,#ef4444)",
    color: "#fff",
    padding: "14px 14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  topInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  badgeHR: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.22)",
  },
  title: { fontWeight: 900, fontSize: 18, letterSpacing: 0.2 },
  subTitle: { fontSize: 12, opacity: 0.9 },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: 12,
    fontWeight: 900,
  },
  navWrap: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  navBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  },
  navBtnSoft: {
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
    opacity: 0.95,
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 14,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  logoutBtn: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
