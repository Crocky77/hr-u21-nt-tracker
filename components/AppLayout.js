import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const TEAM_STAFF = {
  U21: { label: "U21 Hrvatska", coach: "matej1603", assistant: "Zvonzi_" },
  NT: { label: "NT Hrvatska", coach: "Zagi_", assistant: "Nosonja" },
};

function getActiveTeam() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTeam");
}
function setActiveTeam(team) {
  if (typeof window === "undefined") return;
  localStorage.setItem("activeTeam", team);
}

export default function AppLayout({ title = "Dashboard", children }) {
  const router = useRouter();

  const [activeTeam, setActiveTeamState] = useState(null);
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  // Team gate
  useEffect(() => {
    const t = getActiveTeam();
    if (!t) {
      router.replace("/");
      return;
    }
    setActiveTeamState(t);
  }, [router]);

  // Auth + allowlist gate
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
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role);
      setAccess("ok");
    })();
  }, []);

  const staff = activeTeam ? TEAM_STAFF[activeTeam] : null;

  const onSwitchTeam = (team) => {
    setActiveTeam(team);
    setActiveTeamState(team);
    router.replace("/dashboard");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Nemaš pristup</h1>
        <p>Prijavi se s odobrenim emailom ili kontaktiraj admina.</p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading" || !activeTeam) {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background:
          "radial-gradient(1200px 600px at 50% 0%, rgba(211,47,47,0.22) 0%, rgba(255,255,255,1) 60%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #b71c1c 100%)",
          color: "white",
          padding: "14px 18px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                HR
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Hrvatski U21/NT Tracker</div>
                <div style={{ fontSize: 13, opacity: 0.92 }}>
                  {title} · Aktivni tim: <b>{staff?.label || activeTeam}</b> · Izbornik: <b>{staff?.coach}</b> · Pomoćnik:{" "}
                  <b>{staff?.assistant}</b>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, opacity: 0.95 }}>
                <b>{email}</b> {role ? <>(<b>{role}</b>)</> : null}
              </span>

              {/* Team switch */}
              <div
                style={{
                  display: "flex",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                {["U21", "NT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => onSwitchTeam(t)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      border: "none",
                      color: "white",
                      background: activeTeam === t ? "rgba(0,0,0,0.24)" : "transparent",
                      fontWeight: 900,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={logout}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Odjava
              </button>
            </div>
          </div>

          {/* Menu */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" style={menuLinkStyle(router.pathname === "/dashboard")}>Dashboard</Link>
            <Link href="/players" style={menuLinkStyle(router.pathname.startsWith("/players"))}>Igrači</Link>

            <Link href="/popisi" style={menuLinkStyle(router.pathname === "/popisi")}>Popisi</Link>
            <Link href="/upozorenja" style={menuLinkStyle(router.pathname === "/upozorenja")}>Upozorenja</Link>
            <Link href="/postavke-treninga" style={menuLinkStyle(router.pathname === "/postavke-treninga")}>Postavke treninga</Link>
            <Link href="/log" style={menuLinkStyle(router.pathname === "/log")}>Log</Link>

            {activeTeam === "U21" ? (
              <Link href="/u21-kalkulator" style={menuLinkStyle(router.pathname === "/u21-kalkulator")}>
                U21 kalkulator
              </Link>
            ) : null}

            <Link href="/" style={menuLinkStyle(false)}>Promijeni tim</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>{children}</main>
    </div>
  );
}

function menuLinkStyle(active) {
  return {
    background: active ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.16)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    display: "inline-block",
  };
}
