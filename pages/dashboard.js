import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTeam, setActiveTeamState] = useState(null);
  const [loading, setLoading] = useState(true);

  const staff = useMemo(() => TEAM_STAFF, []);

  // Auth
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

  // Team gate
  useEffect(() => {
    const t = getActiveTeam();
    if (!t) {
      router.replace("/");
      return;
    }
    setActiveTeamState(t);
    setLoading(false);
  }, [router]);

  const onSwitchTeam = (team) => {
    setActiveTeam(team);
    setActiveTeamState(team);
    // refresh dashboard (simple)
    router.replace("/dashboard");
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return null;

  const teamLabel = staff[activeTeam]?.label || activeTeam;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% 0%, rgba(211,47,47,0.18) 0%, rgba(255,255,255,1) 60%)",
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
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>
                Hrvatski U21/NT Tracker
              </div>
              <div style={{ fontSize: 12, opacity: 0.95 }}>
                Aktivni tim: <b>{teamLabel}</b>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, opacity: 0.95 }}>
              {user?.email ? `Dobrodošli, ${user.email}` : "Niste prijavljeni"}
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
                    background:
                      activeTeam === t ? "rgba(0,0,0,0.24)" : "transparent",
                    fontWeight: 900,
                  }}
                  title={`Prebaci na ${TEAM_STAFF[t].label}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Link
              href="/players"
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
              Igrači →
            </Link>

            <button
              onClick={onLogout}
              style={{
                background: "rgba(0,0,0,0.25)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Odjava
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px" }}>
        {/* Team staff card */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
            padding: 18,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: "#7a0f0f" }}>
            {teamLabel} — osoblje
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.9 }}>
              Izbornik: <b>{staff[activeTeam].coach}</b>
            </div>
            <div style={{ opacity: 0.9 }}>
              Pomoćnik: <b>{staff[activeTeam].assistant}</b>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.75 }}>
            Napomena: Ovo je MVP dashboard. Sljedeće: statistika iz baze po timu (U21/NT),
            upozorenja (U21 limit 21g+111d), te “brzi rez” igrača.
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <Link
            href="/players"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "white",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 900 }}>Igrači</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Pregled i dodavanje igrača za odabrani tim ({activeTeam}).
            </div>
          </Link>

          <Link
            href="/u21-kalkulator"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "white",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 900 }}>U21 kalkulator</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Demo alat (kasnije točne HT formule i statusi).
            </div>
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "white",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 900 }}>Promijeni tim</div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Vrati se na odabir U21 / NT.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
