import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function IndexPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data?.user?.email ?? null;
      setUserEmail(email);

      if (email) {
        const { data: urows } = await supabase
          .from("users")
          .select("role")
          .eq("email", email)
          .limit(1);

        if (urows && urows.length > 0) setRole(urows[0].role);
      }
    })();
  }, []);

  const chooseTeam = (team) => {
    setActiveTeam(team);
    router.push("/dashboard");
  };

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
          padding: "16px 18px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
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
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
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
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
                Hrvatski U21/NT Tracker
              </div>
              <div style={{ fontSize: 13, opacity: 0.92 }}>
                Selektorski panel · Skauting · U21/NT
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {userEmail ? (
              <div style={{ fontSize: 13, opacity: 0.95 }}>
                Dobrodošli, <b>{userEmail}</b> {role ? <>(<b>{role}</b>)</> : null}
              </div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.95 }}>Nisi prijavljen</div>
            )}

            <Link
              href="/login"
              style={{
                background: "rgba(255,255,255,0.16)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 14px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Prijava →
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            marginTop: 14,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: "#111" }}>Odaberi tim</div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>
            Ovaj alat je namijenjen HR U21 i NT timu. Prijava je trenutno preko emaila (privremeno), a kasnije ide preko
            Hattrick CHPP.
          </div>

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {(["U21", "NT"]).map((t) => {
              const s = TEAM_STAFF[t];
              return (
                <button
                  key={t}
                  onClick={() => chooseTeam(t)}
                  style={{
                    textAlign: "left",
                    borderRadius: 16,
                    padding: 16,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                    boxShadow: "0 12px 26px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#b71c1c" }}>{s.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>→ <Link href="/team/u21/dashboard">→ Otvori dashboard</Link> <Link href="/team/nt/dashboard">→ Otvori dashboard</Link></div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                    Izbornik: <b>{s.coach}</b> · Pomoćnik: <b>{s.assistant}</b>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    (V1) Ručno dodavanje igrača + bilješke. CHPP sync dolazi čim dobijemo licencu.
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
            Savjet: ako si već prijavljen, samo odaberi tim i odmah ćeš ući u odgovarajući dashboard.
          </div>
        </div>
      </main>
    </div>
  );
}
