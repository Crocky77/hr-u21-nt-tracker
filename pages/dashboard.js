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

const U21_LIMIT_TOTAL = 21 * 112 + 111;

function htTotalDays(y, d) {
  if (y == null || d == null) return null;
  return Number(y) * 112 + Number(d);
}

function u21LeftDaysNow(y, d) {
  const total = htTotalDays(y, d);
  if (total == null) return null;
  return U21_LIMIT_TOTAL - total; // >=0 eligible, <0 out
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

  const [cycleDays, setCycleDays] = useState(130); // default

  useEffect(() => {
    setActiveTeam(getActiveTeam());
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase.from("settings").select("u21_cycle_days").eq("id", 1).limit(1);
    if (!error && data && data.length > 0) setCycleDays(data[0].u21_cycle_days);
  }

  async function fetchDashboard() {
    if (!activeTeam) return;
    setLoading(true);

    await fetchSettings();

    const { data, error } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, team_type, status, notes, ht_age_years, ht_age_days")
      .eq("team_type", activeTeam)
      .order("id", { ascending: false })
      .limit(300);

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

  const computed = useMemo(() => {
    const isU21 = activeTeam === "U21";
    const out = [];
    const missing = [];
    const soon14 = [];
    const okToFinal = [];
    const noToFinal = [];

    for (const p of players) {
      const leftNow = isU21 ? u21LeftDaysNow(p.ht_age_years, p.ht_age_days) : null;

      if (isU21) {
        if (leftNow == null) {
          missing.push(p);
          continue;
        }
        if (leftNow < 0) out.push({ p, leftNow });
        if (leftNow >= 0 && leftNow <= 14) soon14.push({ p, leftNow });

        const leftAtFinal = leftNow - cycleDays;
        if (leftAtFinal >= 0) okToFinal.push({ p, leftAtFinal });
        else noToFinal.push({ p, leftAtFinal });
      }
    }

    // sortiranja za prikaz
    soon14.sort((a, b) => a.leftNow - b.leftNow);
    out.sort((a, b) => a.leftNow - b.leftNow); // negativno
    okToFinal.sort((a, b) => a.leftAtFinal - b.leftAtFinal); // najmanji višak prvi
    noToFinal.sort((a, b) => a.leftAtFinal - b.leftAtFinal); // najviše fali (više negativno) prvi

    return { isU21, out, missing, soon14, okToFinal, noToFinal };
  }, [players, activeTeam, cycleDays]);

  const stats = useMemo(() => {
    const total = players.length;
    const core = players.filter((p) => p.status === "core").length;
    const rotation = players.filter((p) => p.status === "rotation").length;
    const watch = players.filter((p) => p.status === "watch").length;
    const risk = players.filter((p) => p.status === "risk").length;

    return {
      total,
      core,
      rotation,
      watch,
      risk,
      outCount: computed.out.length,
      soon14Count: computed.soon14.length,
      okFinalCount: computed.okToFinal.length,
      noFinalCount: computed.noToFinal.length,
      missingCount: computed.missing.length,
    };
  }, [players, computed]);

  const warnings = useMemo(() => {
    const list = [];
    if (computed.isU21) {
      computed.soon14.slice(0, 3).forEach((x) => list.push(`${x.p.full_name} → izlazi za ${x.leftNow} HT dana`));
      computed.noToFinal.slice(0, 2).forEach((x) => list.push(`${x.p.full_name} → NE može do finala (fali ${Math.abs(x.leftAtFinal)} HT dana)`));
      if (stats.missingCount > 0) list.push(`Nedostaje HT dob za ${stats.missingCount} igrača.`);
    }

    for (const p of players.slice(0, 120)) {
      if (p.status === "risk") list.push(`${p.full_name} → status RISK`);
      if ((p.notes || "").toLowerCase().includes("stagn")) list.push(`${p.full_name} → bilješka: stagnacija`);
      if (list.length >= 6) break;
    }

    if (list.length === 0) list.push("Nema upozorenja (MVP).");
    return list.slice(0, 6);
  }, [players, computed, stats.missingCount]);

  return (
    <AppLayout title={computed.isU21 ? "U21 Dashboard" : "NT Dashboard"}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <Widget title={`Aktivni ${activeTeam || ""} igrači`} value={loading ? "…" : stats.total} subtitle="Baza: players" tone="good" />

        {computed.isU21 ? (
          <Widget title="Ispali iz U21" value={loading ? "…" : stats.outCount} subtitle="Po HT dobi (21g+111d)" tone="warn" />
        ) : (
          <Widget title="RISK igrači" value={loading ? "…" : stats.risk} subtitle="MVP status (ručno)" tone="warn" />
        )}

        {computed.isU21 ? (
          <Widget title="Izlaze uskoro" value={loading ? "…" : stats.soon14Count} subtitle="U idućih 14 HT dana" tone="warn" />
        ) : (
          <Widget title="Core igrači" value={loading ? "…" : stats.core} subtitle="MVP status (ručno)" tone="good" />
        )}

        {computed.isU21 ? (
          <Widget
            title="EURO ciklus"
            value={loading ? "…" : stats.okFinalCount}
            subtitle={`Mogu do finala (cycle = ${cycleDays} HT dana)`}
            tone="good"
          />
        ) : (
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
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>(V1) ručno; kasnije automatika.</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={panelStyle}>
          <div style={{ ...panelHeader, background: "#d32f2f", color: "white" }}>⚠️ Upozorenja</div>
          <div style={{ padding: 14 }}>
            {warnings.map((w, idx) => (
              <div key={idx} style={warnRow}>
                {w}
              </div>
            ))}
            {computed.isU21 ? (
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                “EURO ciklus” je trenutno u HT danima (manual). Kad dođe CHPP, vežemo za stvarne datume kola/utakmica.
              </div>
            ) : null}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ ...panelHeader, background: "#1f2937", color: "white" }}>
            U21 ciklus: tko može do finala?
          </div>
          <div style={{ padding: 14 }}>
            {!computed.isU21 ? (
              <div style={{ opacity: 0.75 }}>
                NT dashboard nema U21 ciklus. Prebaci team na U21 da vidiš ovaj dio.
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>✅ Mogu do finala</div>
                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                      {computed.okToFinal.slice(0, 5).map((x) => (
                        <div key={x.p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <span style={{ fontWeight: 800 }}>{x.p.full_name}</span>
                          <span style={{ fontWeight: 900, color: "#166534" }}>+{x.leftAtFinal}d</span>
                        </div>
                      ))}
                      {computed.okToFinal.length === 0 ? <div style={{ opacity: 0.7 }}>Nema.</div> : null}
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>⛔ Ne mogu do finala</div>
                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                      {computed.noToFinal.slice(0, 5).map((x) => (
                        <div key={x.p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <span style={{ fontWeight: 800 }}>{x.p.full_name}</span>
                          <span style={{ fontWeight: 900, color: "#991b1b" }}>-{Math.abs(x.leftAtFinal)}d</span>
                        </div>
                      ))}
                      {computed.noToFinal.length === 0 ? <div style={{ opacity: 0.7 }}>Nema.</div> : null}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
                  <Link href="/players" style={primaryBtn}>
                    Idi na Igrače →
                  </Link>
                  <button onClick={() => fetchDashboard()} style={secondaryBtn}>
                    Osvježi
                  </button>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                  Prikaz: +X znači koliko HT dana ostaje viška na finalu; -X znači koliko fali.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const panelStyle = {
  borderRadius: 18,
  background: "white",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
  overflow: "hidden",
};

const panelHeader = { padding: 14, fontWeight: 900 };

const warnRow = {
  padding: 12,
  borderRadius: 14,
  background: "#fff1f2",
  border: "1px solid #fee2e2",
  fontWeight: 800,
  marginBottom: 10,
};

const primaryBtn = {
  display: "inline-block",
  background: "#1d4ed8",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 900,
  cursor: "pointer",
};
