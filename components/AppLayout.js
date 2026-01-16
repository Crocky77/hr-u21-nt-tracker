// components/AppLayout.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { safeUserLabel } from "../utils/privacy";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Hrvatski U21/NT Tracker";
}

function teamHomeHref(team) {
  if (team === "u21") return "/team/u21";
  if (team === "nt") return "/team/nt";
  return "/";
}

export function AppLayout({
  title = "Hrvatski U21/NT Tracker",
  team = null, // "u21" | "nt" | null
  requireAuth = false,
  children
}) {
  const router = useRouter();
  const [userLabel, setUserLabel] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const homeHref = useMemo(() => teamHomeHref(team), [team]);

  useEffect(() => {
    (async () => {
      setLoadingUser(true);
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      if (!u) {
        setUserLabel(null);
        setLoadingUser(false);
        if (requireAuth) router.replace("/login");
        return;
      }
      setUserLabel(safeUserLabel(u));
      setLoadingUser(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireAuth]);

  async function logout() {
    await supabase.auth.signOut();
    setUserLabel(null);
    router.replace("/login");
  }

  const topTitle = team ? teamLabel(team) : "Hrvatski U21/NT Tracker";

  return (
    <div style={{ minHeight: "100vh", background: "#0f3d2e" }}>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(10, 25, 20, 0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.10)"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href={homeHref} style={{ textDecoration: "none" }}>
              <div style={{ color: "#fff", fontWeight: 1000, letterSpacing: 0.3, fontSize: 16 }}>
                {topTitle}
              </div>
              <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12, marginTop: 2 }}>
                Interni tracker · skauting · liste · upozorenja
              </div>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Javne stranice */}
            <Link href="/" style={linkBtnStyle()}>Naslovnica</Link>

            {/* Team nav */}
            {team && (
              <>
                <Link href={`/team/${team}/players`} style={linkBtnStyle()}>Igrači</Link>
                <Link href={`/team/${team}/alerts`} style={linkBtnStyle()}>Upozorenja</Link>
                <Link href={`/team/${team}/my-players`} style={linkBtnStyle()}>Moji igrači</Link>
              </>
            )}

            {/* Auth */}
            {loadingUser ? (
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Učitavam…</span>
            ) : userLabel ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 800 }}>
                  {userLabel}
                </span>
                <button onClick={logout} style={darkBtnStyle()}>Odjava</button>
              </>
            ) : (
              <Link href="/login" style={darkBtnStyle(true)}>Prijava</Link>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "18px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
            border: "1px solid rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, color: "#111", fontSize: 22, fontWeight: 1000 }}>{title}</h1>
            {team ? (
              <span style={{ fontSize: 12, fontWeight: 900, color: "#b91c1c" }}>
                {team === "u21" ? "U21 modul" : "NT modul"}
              </span>
            ) : null}
          </div>

          <div style={{ marginTop: 12 }}>{children}</div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 18px", color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
        © {new Date().getFullYear()} Hrvatski U21/NT Tracker · Interni alat za skauting i praćenje razvoja
      </footer>
    </div>
  );
}

function linkBtnStyle() {
  return {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13
  };
}

function darkBtnStyle(asLink = false) {
  const base = {
    padding: "9px 12px",
    borderRadius: 12,
    background: "#111",
    color: "#fff",
    fontWeight: 1000,
    fontSize: 13,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  };
  return base;
}

// Kompatibilnost: većina fileova radi import AppLayout from ...
export default AppLayout;
