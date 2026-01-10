import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function Card({ title, value, sub, tone = "neutral" }) {
  const styles = {
    neutral: { border: "1px solid #e5e7eb", background: "#fff" },
    good: { border: "1px solid #bbf7d0", background: "#f0fdf4" },
    warn: { border: "1px solid #fed7aa", background: "#fff7ed" },
    bad: { border: "1px solid #fecaca", background: "#fef2f2" }
  }[tone];

  return (
    <div style={{ ...styles, borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>{sub}</div> : null}
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#f3f4f6", fg: "#111827" },
    good: { bg: "#dcfce7", fg: "#166534" },
    warn: { bg: "#ffedd5", fg: "#9a3412" },
    bad: { bg: "#fee2e2", fg: "#991b1b" }
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.fg, fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}

export default function Dashboard() {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [access, setAccess] = useState("unknown");

  // Ovo su demo podaci dok ne spojimo CHPP + prave tablice
  const demo = useMemo(
    () => ({
      mode: "U21",
      cards: {
        totalCandidates: 128,
        fullCycle: 34,
        expiring30: 6,
        injuries: 3,
        cardsRisk: 5
      },
      alerts: [
        { tone: "bad", title: "U21 izlazak ≤ 30 dana", text: "6 igrača izlazi iz U21 uskoro. Prioritet: finalna selekcija i plan poziva." },
        { tone: "warn", title: "Rizični kartoni", text: "5 igrača je na rubu suspenzije. Provjeri prije sljedeće utakmice." }
      ],
      quick: [
        { title: "U21 kalkulator", desc: "Provjeri full-cycle i cutoff datume", href: "/u21-kalkulator" },
        { title: "Popis igrača", desc: "Filtriranje po poziciji, dobi, statusu", href: "/players" }, // napravit ćemo kasnije
        { title: "Karton & ozljede", desc: "Brzi pregled rizičnih", href: "/status" } // kasnije
      ],
      table: [
        { name: "I. Marić", pos: "WB", age: "20y 88d", note: "Full-cycle ✅", tone: "good" },
        { name: "M. Kovač", pos: "IM", age: "21y 95d", note: "Izlazi prije finala ⚠️", tone: "warn" },
        { name: "A. Horvat", pos: "GK", age: "21y 110d", note: "Cutoff kritično ⛔", tone: "bad" }
      ]
    }),
    []
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      setEmail(userEmail);

      if (!userEmail) {
        setAccess("denied");
        return;
      }

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

  if (access === "unknown") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        <h2>Učitavam dashboard...</h2>
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>🇭🇷 Hrvatski U21 / NT Tracker</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Hrvatski U21 / NT Tracker</div>
          <h1 style={{ margin: "6px 0 0", color: "#c00" }}>Dashboard</h1>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill tone="neutral">Mod: {demo.mode}</Pill>
            <Pill tone="good">Ulogiran: {email}</Pill>
            <Pill tone="neutral">Uloga: {role}</Pill>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            Naslovna
          </Link>
          <Link href="/u21-kalkulator" style={{ padding: "10px 12px", borderRadius: 10, background: "#111", color: "#fff", textDecoration: "none" }}>
            U21 kalkulator
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        <Card title="Kandidati" value={demo.cards.totalCandidates} sub="Ukupno u praćenju" />
        <Card title="Full-cycle U21" value={demo.cards.fullCycle} sub="Idealni za cijeli ciklus" tone="good" />
        <Card title="Izlaze ≤ 30d" value={demo.cards.expiring30} sub="Prioritet za odluku" tone="bad" />
        <Card title="Ozlijeđeni" value={demo.cards.injuries} sub="Trenutno nedostupni" tone="warn" />
        <Card title="Rizični kartoni" value={demo.cards.cardsRisk} sub="Provjeri prije poziva" tone="warn" />
      </div>

      {/* Alerts + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Upozorenja</div>
          <div style={{ display: "grid", gap: 10 }}>
            {demo.alerts.map((a, idx) => (
              <div key={idx} style={{ borderRadius: 12, padding: 12, border: "1px solid #e5e7eb", background: a.tone === "bad" ? "#fef2f2" : a.tone === "warn" ? "#fff7ed" : "#f9fafb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>{a.title}</div>
                  <Pill tone={a.tone}>{a.tone === "bad" ? "⛔" : "⚠️"}</Pill>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{a.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Brze akcije</div>
          <div style={{ display: "grid", gap: 10 }}>
            {demo.quick.map((q) => (
              <Link
                key={q.title}
                href={q.href}
                style={{ textDecoration: "none", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, display: "block" }}
              >
                <div style={{ fontWeight: 800, color: "#111" }}>{q.title}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{q.desc}</div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            * Ovo su demo linkovi dok ne napravimo ostale stranice.
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: 12, border: "1px solid #e5e7eb", background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>Top prioriteti (demo)</div>
          <Pill tone="neutral">U21 shortlist</Pill>
        </div>

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Igrač</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Pozicija</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Dob</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Napomena</th>
              </tr>
            </thead>
            <tbody>
              {demo.table.map((r) => (
                <tr key={r.name}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6", fontWeight: 700 }}>{r.name}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.pos}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.age}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>
                    <Pill tone={r.tone}>{r.note}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Sljedeći korak: demo brojeve zamijeniti stvarnim (CHPP sync + U21 logika).
      </div>
    </main>
  );
}
