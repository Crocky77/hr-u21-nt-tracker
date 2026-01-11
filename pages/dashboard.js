import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" },
  };
  return map[kind] || map.watch;
}

function Widget({ title, value, subtitle, tone }) {
  const tones = {
    good: { bg: "#e9fbeef0", border: "#c7f2d4" },
    warn: { bg: "#fff6eaf0", border: "#ffe0b2" },
    neutral: { bg: "#ffffff", border: "#e5e7eb" },
  };
  const t = tones[tone || "neutral"];

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 16,
        border: `1px solid ${t.border}`,
        background: t.bg,
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
        minHeight: 110,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.85 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 46, fontWeight: 900, color: "#111", lineHeight: 1 }}>{value}</div>
      {subtitle ? <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{subtitle}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();

  const [activeTeam, setActiveTeamState] = useState(null);
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [players, setPlayers] = useState([]);

  // 1) Team gate
  useEffect(() => {
    const t = getActiveTeam();
    if (!t) {
      router.replace("/");
      return;
    }
    setActiveTeamState(t);
  }, [router]);

  // 2) Auth + role gate
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

  async function fetchDashboard() {
    if (!activeTeam) return;
    setLoadingData(true);

    const { data, error } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, dob, team_type, status, notes, created_at")
      .eq("team_type", activeTeam)
      .order("id", { ascending: false })
      .limit(50);

    if (error) {
      alert("Greška kod dohvata dashboard podataka: " + error.message);
      setPlayers([]);
    } else {
      setPlayers(data || []);
    }

    setLoadingData(false);
  }

  useEffect(() => {
    if (access === "ok" && activeTeam) fetchDashboard();
  }, [access, activeTeam]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  const staff = activeTeam ? TEAM_STAFF[activeTeam] : null;

  const onSwitchTeam = (team) => {
    setActiveTeam(team);
    setActiveTeamState(team);
    router.replace("/dashboard");
  };

  const stats = useMemo(() => {
    const total = players.length;
    const core = players.filter((p) => p.status === "core").length;
    const rotation = players.filter((p) => p.status === "rotation").length;
    const watch = players.filter((p) => p.status === "watch").length;
    const risk = players.filter((p) => p.status === "risk").length;

    // Placeholder logika “ispadaju” dok ne uvedemo pravu HT dob (21g+111d)
    // Za sad: risk status tretiramo kao “ispadaju / kritično” (demo)
    const falling = risk;

    return { total, core, rotation, watch, risk, falling };
  }, [players]);

  // Demo “kritična upozorenja”
  const criticalWarnings = useMemo(() => {
    const list = [];
    players.slice(0, 10).forEach((p) => {
      if (p.status === "risk") list.push(`${p.full_name} → status RISK (provjeri dob/plan treninga)`);
      if ((p.notes || "").toLowerCase().includes("stagn")) list.push(`${p.full_name} → bilješka: stagnacija`);
    });

    if (list.length === 0) {
      // default demo, da dashboard nije prazan
      list.push("Nema kritičnih upozorenja (demo).");
      list.push("Kad uvedemo HT dob + trening formulu, ovdje će biti automatska upozorenja.");
    }
    return list.slice(0, 3);
  }, [players]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Dashboard</h1>
        <p>
          <strong>Nemaš pristup.</strong> Prijavi se s odobrenim emailom ili kontaktiraj admina.
        </p>
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
      {/* Header + Menu */}
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
                  Aktivni tim: <b>{staff?.label || activeTeam}</b> · Izbornik: <b>{staff?.coach}</b> · Pomoćnik:{" "}
                  <b>{staff?.assistant}</b>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, opacity: 0.95 }}>
                Dobrodošli, <b>{email}</b> {role ? <>(<b>{role}</b>)</> : null}
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
            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.16)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Naslovna
            </Link>

            <Link
              href="/dashboard"
              style={{
                background: "rgba(0,0,0,0.20)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Dashboard
            </Link>

            <Link
              href="/players"
              style={{
                background: "rgba(255,255,255,0.16)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Igrači
            </Link>

            {/* Portal tracker stil - ali za V1 “uskoro” */}
            <button
              onClick={() => alert("Uskoro (V1.1): Popisi")}
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Popisi
            </button>
            <button
              onClick={() => alert("Uskoro (V1.1): Upozorenja")}
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Upozorenja
            </button>
            <button
              onClick={() => alert("Uskoro (V1.2): Postavke treninga")}
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Postavke treninga
            </button>
            <button
              onClick={() => alert("Uskoro (V1.2): Log")}
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 900,
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Log
            </button>

            {/* U21 only */}
            {activeTeam === "U21" ? (
              <Link
                href="/u21-kalkulator"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "10px 12px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 900,
                }}
              >
                U21 kalkulator
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {/* Widgets row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <Widget
            title={`Aktivni ${activeTeam} igrači`}
            value={loadingData ? "…" : stats.total}
            subtitle={activeTeam === "U21" ? "Baza: U21 Hrvatska" : "Baza: NT Hrvatska"}
            tone="good"
          />
          <Widget
            title="Igrači ispadaju"
            value={loadingData ? "…" : stats.falling}
            subtitle="Demo: trenutno = RISK status"
            tone="warn"
          />
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              border: "1px solid #e5e7eb",
              background: "white",
              boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
              minHeight: 110,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.85 }}>Status raspodjela</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                ["core", stats.core],
                ["rotation", stats.rotation],
                ["watch", stats.watch],
                ["risk", stats.risk],
              ].map(([k, v]) => {
                const b = badgeStyle(k);
                return (
                  <span
                    key={k}
                    style={{
                      display: "inline-flex",
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: b.bg,
                      color: b.fg,
                      fontWeight: 900,
                    }}
                  >
                    {k}: {loadingData ? "…" : v}
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
              (V1) status je ručno postavljen; kasnije automatski prema formuli/treningu.
            </div>
          </div>
          <Widget
            title="Najveći napredak"
            value={loadingData ? "…" : "—"}
            subtitle="Uskoro: trening formula + snapshot"
            tone="neutral"
          />
        </div>

        {/* Lower row */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Warnings */}
          <div
            style={{
              borderRadius: 18,
              background: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 14, background: "#d32f2f", color: "white", fontWeight: 900, display: "flex", gap: 10 }}>
              <span>⚠️</span> Kritična upozorenja
            </div>
            <div style={{ padding: 14 }}>
              {criticalWarnings.map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#fff1f2",
                    border: "1px solid #fee2e2",
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  {w}
                </div>
              ))}
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Kad uvedemo pravu HT dob (21g+111d) i trening formulu, upozorenja će biti automatska.
              </div>
            </div>
          </div>

          {/* Quick list */}
          <div
            style={{
              borderRadius: 18,
              background: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 14, background: "#1f2937", color: "white", fontWeight: 900 }}>
              Pregled igrača (brzi rez) — {activeTeam}
            </div>
            <div style={{ padding: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                    <th style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>Ime</th>
                    <th style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>Poz</th>
                    <th style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(players || []).slice(0, 5).map((p) => {
                    const b = badgeStyle(p.status);
                    return (
                      <tr key={p.id}>
                        <td style={{ padding: "10px 6px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                          {p.full_name}
                          {p.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {p.ht_player_id}</div> : null}
                        </td>
                        <td style={{ padding: "10px 6px", borderBottom: "1px solid #f3f4f6" }}>{p.position}</td>
                        <td style={{ padding: "10px 6px", borderBottom: "1px solid #f3f4f6" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "6px 10px",
                              borderRadius: 10,
                              background: b.bg,
                              color: b.fg,
                              fontWeight: 900,
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {!loadingData && players.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: 12, opacity: 0.75 }}>
                        Nema igrača u bazi za {activeTeam}. Dodaj prvog na stranici “Igrači”.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/players"
                  style={{
                    display: "inline-block",
                    background: "#1d4ed8",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 900,
                  }}
                >
                  Vidi sve igrače →
                </Link>

                <button
                  onClick={fetchDashboard}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Osvježi
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                * Ovo su stvarni podaci iz baze. “Forma/stamina/trening” dolaze s CHPP + trening formulom.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
