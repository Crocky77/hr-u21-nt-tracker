import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Jednostavan "grb" (SVG) bez vanjskih slika */
function Crest() {
  return (
    <svg width="54" height="54" viewBox="0 0 64 64" aria-label="Grb">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#b40000" />
          <stop offset="1" stopColor="#ff3b3b" />
        </linearGradient>
      </defs>
      <path
        d="M32 4c10 8 18 6 26 8v20c0 16-10 24-26 28C16 56 6 48 6 32V12c8-2 16 0 26-8Z"
        fill="url(#g)"
        stroke="#ffffff"
        strokeWidth="2"
      />
      {/* šahovnica */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 18 + (i % 4) * 7;
        const y = 18 + Math.floor(i / 4) * 7;
        const red = (i + Math.floor(i / 4)) % 2 === 0;
        return <rect key={i} x={x} y={y} width="7" height="7" fill={red ? "#ffffff" : "#b40000"} opacity="0.95" />;
      })}
    </svg>
  );
}

function Pill({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "rgba(255,255,255,.18)", fg: "#fff", bd: "rgba(255,255,255,.22)" },
    dark: { bg: "#111", fg: "#fff", bd: "#111" },
    warn: { bg: "#ffedd5", fg: "#9a3412", bd: "#fed7aa" },
    bad: { bg: "#fee2e2", fg: "#991b1b", bd: "#fecaca" },
    good: { bg: "#dcfce7", fg: "#166534", bd: "#bbf7d0" }
  };
  const s = map[tone] || map.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        fontSize: 12,
        fontWeight: 800
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ title, big, sub, tone = "neutral" }) {
  const tones = {
    neutral: { top: "#f7f7f7", bd: "#e6e6e6" },
    warn: { top: "#fff7ed", bd: "#fed7aa" },
    bad: { top: "#fef2f2", bd: "#fecaca" },
    good: { top: "#f0fdf4", bd: "#bbf7d0" }
  };
  const t = tones[tone] || tones.neutral;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${t.bd}`,
        borderRadius: 14,
        boxShadow: "0 10px 28px rgba(0,0,0,.10)",
        overflow: "hidden"
      }}
    >
      <div style={{ padding: 14, background: t.top, borderBottom: `1px solid ${t.bd}` }}>
        <div style={{ fontWeight: 900, color: "#1f2937" }}>{title}</div>
      </div>
      <div style={{ padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, color: "#111" }}>{big}</div>
        {sub ? <div style={{ marginTop: 10, opacity: 0.75, fontWeight: 700 }}>{sub}</div> : null}
      </div>
    </div>
  );
}

function Panel({ title, icon, children, tone = "neutral" }) {
  const head = {
    neutral: { bg: "#f3f4f6", fg: "#111827", bd: "#e5e7eb" },
    bad: { bg: "#dc2626", fg: "#fff", bd: "#b91c1c" }
  }[tone];

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid #e5e7eb`,
        borderRadius: 14,
        boxShadow: "0 10px 28px rgba(0,0,0,.10)",
        overflow: "hidden"
      }}
    >
      <div style={{ padding: 14, background: head.bg, color: head.fg, borderBottom: `1px solid ${head.bd}`, fontWeight: 900, display: "flex", gap: 10, alignItems: "center" }}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

export default function Home() {
  // Auth + role gate (kao prije)
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  // U21/NT toggle (za sada UI, kasnije pravi filter)
  const [mode, setMode] = useState("U21"); // "U21" | "NT"

  const demo = useMemo(() => {
    if (mode === "U21") {
      return {
        stats: {
          active: 27,
          dropping: 6,
          topForm: [{ n: "K. Jurić", v: 8 }, { n: "M. Kovač", v: 8 }, { n: "A. Babić", v: 8 }],
          biggestUp: [{ n: "L. Petrović", v: "+2" }, { n: "S. Radić", v: "+1.5" }, { n: "T. Grgić", v: "+1" }]
        },
        alerts: [
          { icon: "❗", who: "Marko Šimić", txt: "Ispada iz U21 za 3 tjedna" },
          { icon: "⚠️", who: "Ivan Horvat", txt: "Slaba forma, stagnacija" },
          { icon: "🧠", who: "Plan", txt: "Potražiti novog CB za idući ciklus!" }
        ],
        table: [
          { name: "Marko Šimić", pos: "DEF", age: "22 g. (78 d.)", status: "Zadnja sezona", badge: "bad" },
          { name: "Ivan Horvat", pos: "GK", age: "21 g. (110 d.)", status: "U21", badge: "warn" },
          { name: "Luka Vidić", pos: "MID", age: "20 g. (250 d.)", status: "Potencijal", badge: "good" }
        ]
      };
    }
    return {
      stats: {
        active: 34,
        dropping: 2,
        topForm: [{ n: "D. Matić", v: 8 }, { n: "I. Brkić", v: 8 }, { n: "M. Perić", v: 7.5 }],
        biggestUp: [{ n: "N. Kranjčar", v: "+1.5" }, { n: "T. Rajić", v: "+1" }, { n: "A. Katić", v: "+1" }]
      },
      alerts: [
        { icon: "❗", who: "Transfer", txt: "2 ključna igrača na marketu (watchlist)" },
        { icon: "⚠️", who: "Kartoni", txt: "3 igrača na rubu suspenzije" }
      ],
      table: [
        { name: "D. Matić", pos: "IM", age: "25 g.", status: "Core", badge: "good" },
        { name: "I. Brkić", pos: "FWD", age: "24 g.", status: "Forma ↑", badge: "warn" },
        { name: "M. Perić", pos: "CD", age: "27 g.", status: "Praćenje", badge: "neutral" }
      ]
    };
  }, [mode]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

      const { data: rows } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      if (!rows || rows.length === 0) {
        setAccess("denied");
        return;
      }
      setRole(rows[0].role);
      setAccess("ok");
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  // Public landing (ako nije ulogiran) – i dalje “wow”
  if (access === "denied") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        <div
          style={{
            background: "linear-gradient(180deg, #b40000 0%, #e11d48 70%, #f3f4f6 70%)",
            paddingBottom: 40
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Crest />
              <div style={{ color: "#fff" }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>Hrvatski U21/NT Tracker</div>
                <div style={{ opacity: 0.9, fontWeight: 700 }}>Skauting i selekcija – Hrvatska U21 + NT</div>
              </div>
            </div>

            <Link
              href="/login"
              style={{
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 900
              }}
            >
              Prijava
            </Link>
          </div>

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 18px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill>✅ U21 cutoff + full-cycle</Pill>
              <Pill>📝 Bilješke skauta</Pill>
              <Pill>⚠️ Upozorenja: trening / forma / kartoni</Pill>
              <Pill>🔜 CHPP prijava (Hattrick)</Pill>
            </div>

            <div style={{ marginTop: 18, background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 10px 28px rgba(0,0,0,.10)", border: "1px solid #eee" }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Pristup je samo za odobrene korisnike.</div>
              <div style={{ marginTop: 8, opacity: 0.75, fontWeight: 700 }}>
                Prijavi se emailom (privremeno) – kasnije ide Hattrick CHPP login i prikaz nicka gore desno.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (access === "loading") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        Učitavam...
      </main>
    );
  }

  // Logged-in dashboard homepage (wow)
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "linear-gradient(180deg, #b40000 0%, #e11d48 100%)", boxShadow: "0 10px 28px rgba(0,0,0,.18)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Crest />
            <div style={{ color: "#fff" }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Hrvatski U21/NT Tracker</div>
              <div style={{ opacity: 0.9, fontWeight: 700 }}>Dashboard</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Pill>Mod: {mode}</Pill>
            {/* Kasnije ovdje ide nick s Hattricka; zasad email */}
            <Pill>Dobrodošao, {email}</Pill>
            <Link href="/dashboard" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, padding: "8px 10px" }}>
              Postavke
            </Link>
            <button
              onClick={logout}
              style={{ background: "#111", color: "#fff", border: "none", padding: "10px 12px", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}
            >
              Odjava
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        {/* Mode switch */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setMode("U21")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: mode === "U21" ? "#111" : "#fff",
              color: mode === "U21" ? "#fff" : "#111",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            U21
          </button>
          <button
            onClick={() => setMode("NT")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: mode === "NT" ? "#111" : "#fff",
              color: mode === "NT" ? "#fff" : "#111",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            NT
          </button>

          <Link href="/u21-kalkulator" style={{ marginLeft: "auto", padding: "10px 14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", textDecoration: "none", fontWeight: 900 }}>
            U21 kalkulator
          </Link>
        </div>

        {/* Cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <StatCard title={`Aktivni ${mode} igrači`} big={demo.stats.active} sub="u praćenju" tone="neutral" />
          <StatCard title="Igrači ispadaju" big={demo.stats.dropping} sub={mode === "U21" ? "kritično uskoro" : "prioritet provjera"} tone="warn" />

          <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, boxShadow: "0 10px 28px rgba(0,0,0,.10)", overflow: "hidden" }}>
            <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e6e6e6", fontWeight: 900 }}>Top forma</div>
            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              {demo.stats.topForm.map((x) => (
                <div key={x.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>{x.n}</div>
                  <span style={{ background: "#0f766e", color: "#fff", fontWeight: 900, padding: "6px 10px", borderRadius: 10 }}>{x.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 14, boxShadow: "0 10px 28px rgba(0,0,0,.10)", overflow: "hidden" }}>
            <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e6e6e6", fontWeight: 900 }}>Najveći napredak</div>
            <div style={{ padding: 14, display: "grid", gap: 10 }}>
              {demo.stats.biggestUp.map((x) => (
                <div key={x.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>{x.n}</div>
                  <span style={{ color: "#16a34a", fontWeight: 900 }}>{x.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
          <Panel title="Kritična upozorenja" icon="⚠️" tone="bad">
            <div style={{ display: "grid", gap: 10 }}>
              {demo.alerts.map((a, i) => (
                <div key={i} style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 18 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontWeight: 900 }}>{a.who}</div>
                    <div style={{ opacity: 0.85, fontWeight: 700 }}>{a.txt}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Pregled igrača" icon="📋">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.7 }}>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Ime</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Pozicija</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Dob</th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {demo.table.map((r) => (
                    <tr key={r.name}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>{r.name}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.pos}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.age}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "6px 10px",
                            borderRadius: 10,
                            fontWeight: 900,
                            background:
                              r.badge === "good" ? "#dcfce7" : r.badge === "warn" ? "#ffedd5" : r.badge === "bad" ? "#fee2e2" : "#f3f4f6",
                            color:
                              r.badge === "good" ? "#166534" : r.badge === "warn" ? "#9a3412" : r.badge === "bad" ? "#991b1b" : "#111827"
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <Link
                href="/players"
                style={{
                  background: "#1d4ed8",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 900,
                  padding: "10px 14px",
                  borderRadius: 12
                }}
              >
                Vidi sve igrače
              </Link>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              * “Players” stranicu dodajemo sljedeće (sad je link placeholder).
            </div>
          </Panel>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
          Napomena: trenutno su brojevi demo. Kad dobijemo CHPP licencu i API key, punimo ih stvarnim podacima i gore desno prikazujemo Hattrick nick.
        </div>
      </div>
    </div>
  );
}
