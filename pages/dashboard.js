import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

function getActiveTeam() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTeam");
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

function Widget({ title, value, subtitle, tone = "neutral" }) {
  const tones = {
    good: { bg: "#e9fbeef0", border: "#c7f2d4" },
    warn: { bg: "#fff6eaf0", border: "#ffe0b2" },
    neutral: { bg: "#ffffff", border: "#e5e7eb" },
  };
  const t = tones[tone];

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
      <div style={{ marginTop: 10, fontSize: 46, fontWeight: 900, color: "#111", lineHeight: 1 }}>
        {value}
      </div>
      {subtitle ? <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{subtitle}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const t = getActiveTeam();
    setActiveTeam(t);
  }, []);

  async function fetchDashboard() {
    if (!activeTeam) return;
    setLoading(true);

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
    setLoading(false);
  }

  useEffect(() => {
    if (activeTeam) fetchDashboard();
  }, [activeTeam]);

  const stats = useMemo(() => {
    const total = players.length;
    const core = players.filter((p) => p.status === "core").length;
    const rotation = players.filter((p) => p.status === "rotation").length;
    const watch = players.filter((p) => p.status === "watch").length;
    const risk = players.filter((p) => p.status === "risk").length;

    // MVP: "ispadaju" = risk (dok ne uvedemo pravu HT dob +111d logiku)
    const falling = risk;

    return { total, core, rotation, watch, risk, falling };
  }, [players]);

  const criticalWarnings = useMemo(() => {
    const list = [];
    players.forEach((p) => {
      if (p.status === "risk") list.push(`${p.full_name} → status RISK (provjeri dob / plan treninga)`);
      if ((p.notes || "").toLowerCase().includes("stagn")) list.push(`${p.full_name} → bilješka: stagnacija`);
    });
    if (list.length === 0) {
      list.push("Nema kritičnih upozorenja (MVP).");
      list.push("Kad uvedemo HT dob + trening formulu, ovdje će biti automatska upozorenja.");
    }
    return list.slice(0, 4);
  }, [players]);

  return (
    <AppLayout title="Dashboard">
      {/* Widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <Widget
          title={`Aktivni ${activeTeam || ""} igrači`}
          value={loading ? "…" : stats.total}
          subtitle="Podaci iz baze (players)"
          tone="good"
        />
        <Widget
          title="Igrači ispadaju"
          value={loading ? "…" : stats.falling}
          subtitle="MVP: trenutno = RISK"
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
                  {k}: {loading ? "…" : v}
                </span>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
            (V1) status je ručni; kasnije automatika prema formuli/treningu.
          </div>
        </div>
        <Widget
          title="Trening / forma / stamina"
          value="—"
          subtitle="Dolazi s CHPP + trening formulom"
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
          <div style={{ padding: 14, background: "#d32f2f", color: "white", fontWeight: 900 }}>
            ⚠️ Kritična upozorenja
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
              U sljedećem koraku ubacujemo: HT dob (21g+111d) + “izlazi za X dana”.
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
            Brzi rez — zadnjih 5 igrača
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

                {!loading && players.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, opacity: 0.75 }}>
                      Nema igrača u bazi za ovaj tim. Dodaj prvog na stranici “Igrači”.
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
              * “Forma/stamina/trening” dolaze nakon CHPP licence + trening formule.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
