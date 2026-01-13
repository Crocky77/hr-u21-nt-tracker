// components/AppLayout.js
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

function CheckerboardIcon() {
  // mali "šahovnica" motiv kao SVG (ne treba nikakav asset)
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" style={{ borderRadius: 10, overflow: "hidden" }}>
      <rect width="34" height="34" fill="#ffffff" />
      {/* 4x4 kockice */}
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => {
          const size = 34 / 4;
          const x = c * size;
          const y = r * size;
          const isRed = (r + c) % 2 === 0;
          return <rect key={`${r}-${c}`} x={x} y={y} width={size} height={size} fill={isRed ? "#d61f2c" : "#ffffff"} />;
        })
      )}
    </svg>
  );
}

export default function AppLayout({
  title = "Hrvatski U21/NT Tracker",
  team = null, // "u21" | "nt" | null
  teamLabel = "",
  email = "",
  role = "",
  children
}) {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const isTeam = team === "u21" || team === "nt";

  const navBtn = (href, label, active = false) => (
    <Link
      href={href}
      style={{
        padding: "10px 14px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 900,
        border: active ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.25)",
        background: active ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.10)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        gap: 8
      }}
    >
      {label}
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* HEADER */}
      <header
        style={{
          background: "linear-gradient(135deg, #b81424 0%, #e5343f 45%, #a70f1f 100%)",
          color: "#fff",
          padding: "18px 18px 14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.20)"
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          {/* Left brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckerboardIcon />
              <div>
                <div style={{ fontSize: 18, fontWeight: 1000, lineHeight: 1.15 }}>{title}</div>
                <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700 }}>
                  Selektorski panel · Scouting · U21/NT
                </div>
              </div>
            </div>

            {isTeam ? (
              <div style={{ display: "flex", gap: 8, marginLeft: 12, flexWrap: "wrap" }}>
                <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.20)", fontWeight: 900 }}>
                  {teamLabel || (team === "u21" ? "U21 Hrvatska" : "NT Hrvatska")}
                </span>
                {role ? (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.12)", fontWeight: 900 }}>
                    {role}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Right user */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {email ? (
              <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 800 }}>
                Dobrodošli, <span style={{ textDecoration: "underline" }}>{email}</span>
              </div>
            ) : null}
            <button
              onClick={logout}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "none",
                background: "#101114",
                color: "#fff",
                fontWeight: 1000,
                cursor: "pointer"
              }}
            >
              Odjava
            </button>
          </div>
        </div>

        {/* NAV */}
        <div style={{ maxWidth: 1120, margin: "12px auto 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {navBtn("/", "Naslovna", router.pathname === "/")}
          {!isTeam ? (
            <>
              {navBtn("/about", "O alatu", router.pathname === "/about")}
              {navBtn("/help", "Pomoć", router.pathname === "/help")}
              {navBtn("/donations", "Donacije", router.pathname === "/donations")}
            </>
          ) : (
            <>
              {navBtn(`/team/${team}/dashboard`, "Dashboard", router.asPath.includes("/dashboard"))}
              {navBtn(`/team/${team}/players`, "Igrači", router.asPath.includes("/players"))}
              {navBtn(`/team/${team}/alerts`, "Upozorenja", router.asPath.includes("/alerts"))}
            </>
          )}
        </div>
      </header>

      {/* BODY */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 16px 50px" }}>
        {children}
      </main>
    </div>
  );
}
