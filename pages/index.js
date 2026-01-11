import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const TEAM_STAFF = {
  U21: { label: "U21 Hrvatska", coach: "matej1603", assistant: "Zvonzi_" },
  NT: { label: "NT Hrvatska", coach: "Zagi_", assistant: "Nosonja" },
};

function setActiveTeam(team) {
  if (typeof window === "undefined") return;
  localStorage.setItem("activeTeam", team);
}
function getActiveTeam() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTeam");
}

function PlayerFigure({ variant = "home" }) {
  // Simple CSS “player” (no images) for V1 wow effect
  const isHome = variant === "home";
  return (
    <div
      style={{
        width: 220,
        height: 420,
        position: "relative",
        filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.25))",
        opacity: 0.95,
      }}
      aria-hidden="true"
    >
      {/* Head */}
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 999,
          background: "rgba(255,255,255,0.85)",
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          border: "2px solid rgba(0,0,0,0.08)",
        }}
      />
      {/* Torso */}
      <div
        style={{
          width: 150,
          height: 170,
          borderRadius: 22,
          position: "absolute",
          left: "50%",
          top: 90,
          transform: "translateX(-50%)",
          border: "2px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
          background: isHome
            ? "linear-gradient(90deg, #d32f2f 0%, #ffffff 20%, #d32f2f 40%, #ffffff 60%, #d32f2f 80%, #ffffff 100%)"
            : "linear-gradient(180deg, #0b2a5b 0%, #133a7a 50%, #0b2a5b 100%)",
        }}
      >
        {/* Chest badge */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            position: "absolute",
            left: 16,
            top: 18,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />
        {/* Number */}
        <div
          style={{
            position: "absolute",
            right: 18,
            top: 16,
            fontWeight: 800,
            fontSize: 22,
            color: isHome ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)",
          }}
        >
          10
        </div>
      </div>

      {/* Shorts */}
      <div
        style={{
          width: 140,
          height: 85,
          borderRadius: 18,
          background: isHome ? "rgba(20,20,20,0.92)" : "rgba(245,245,245,0.92)",
          position: "absolute",
          left: "50%",
          top: 252,
          transform: "translateX(-50%)",
          border: "2px solid rgba(0,0,0,0.08)",
        }}
      />

      {/* Legs */}
      <div
        style={{
          width: 42,
          height: 120,
          borderRadius: 16,
          background: "rgba(255,255,255,0.85)",
          position: "absolute",
          left: "50%",
          top: 332,
          transform: "translateX(-70px)",
          border: "2px solid rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          width: 42,
          height: 120,
          borderRadius: 16,
          background: "rgba(255,255,255,0.85)",
          position: "absolute",
          left: "50%",
          top: 332,
          transform: "translateX(28px)",
          border: "2px solid rgba(0,0,0,0.06)",
        }}
      />

      {/* Boots */}
      <div
        style={{
          width: 64,
          height: 24,
          borderRadius: 14,
          background: isHome ? "#111" : "#b71c1c",
          position: "absolute",
          left: "50%",
          top: 448,
          transform: "translateX(-98px)",
        }}
      />
      <div
        style={{
          width: 64,
          height: 24,
          borderRadius: 14,
          background: isHome ? "#111" : "#b71c1c",
          position: "absolute",
          left: "50%",
          top: 448,
          transform: "translateX(34px)",
        }}
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const staff = useMemo(() => TEAM_STAFF, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handlePick = (team) => {
    setActiveTeam(team);
    router.push("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% 0%, rgba(211,47,47,0.25) 0%, rgba(255,255,255,1) 60%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #b71c1c 100%)",
          color: "white",
          padding: "18px 18px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background:
                  "linear-gradient(90deg, #ffffff 0%, #d32f2f 45%, #ffffff 90%)",
                border: "1px solid rgba(255,255,255,0.35)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                color: "#7a0f0f",
              }}
              title="HR"
            >
              HR
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>
                Hrvatski U21/NT Tracker
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Selektorski panel • Skauting • U21/NT
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <>
                <span style={{ fontSize: 13, opacity: 0.95 }}>
                  Ulogiran: {user.email}
                </span>
                <Link
                  href="/dashboard"
                  style={{
                    background: "rgba(255,255,255,0.16)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                    padding: "10px 12px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 800,
                  }}
                >
                  Dashboard →
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "10px 12px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                Prijava →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(320px, 540px) 1fr",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlayerFigure variant="home" />
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
              padding: 22,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: "#7a0f0f" }}>
              Odaberi tim
            </div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Ovaj tracker je namijenjen HR U21 i NT timu. Prijava je trenutno preko
              emaila (privremeno), a kasnije ide preko Hattrick CHPP.
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gap: 12,
              }}
            >
              {(["U21", "NT"]).map((t) => (
                <button
                  key={t}
                  onClick={() => handlePick(t)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background:
                      t === "U21"
                        ? "linear-gradient(135deg, rgba(211,47,47,0.14) 0%, rgba(255,255,255,1) 60%)"
                        : "linear-gradient(135deg, rgba(11,42,91,0.14) 0%, rgba(255,255,255,1) 60%)",
                    padding: 16,
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>
                        {staff[t].label}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                        Izbornik: <b>{staff[t].coach}</b> • Pomoćnik:{" "}
                        <b>{staff[t].assistant}</b>
                      </div>
                    </div>
                    <div
                      style={{
                        alignSelf: "center",
                        fontWeight: 900,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.06)",
                      }}
                    >
                      Odaberi →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
              Tip: Ako nemaš pristup, trebaš biti pozvan (invite-only).
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlayerFigure variant="away" />
          </div>
        </div>
      </div>
    </div>
  );
}
