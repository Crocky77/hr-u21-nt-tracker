import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AppLayout from "../components/AppLayout";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// hardcoded osoblje za MVP (kasnije povučemo iz CHPP)
const STAFF = {
  U21: { teamLabel: "U21 Hrvatska", coach: "matej1603", assistant: "Zvonzi_" },
  NT: { teamLabel: "NT Hrvatska", coach: "Zagi_", assistant: "Nosonja" },
};

function Card({ title, value, sub, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#fff", border: "#e5e7eb" },
    good: { bg: "#ecfdf5", border: "#a7f3d0" },
    warn: { bg: "#fff7ed", border: "#fed7aa" },
    bad: { bg: "#fef2f2", border: "#fecaca" },
    dark: { bg: "#111827", border: "#111827" },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontWeight: 900, opacity: 0.9 }}>{title}</div>
      <div style={{ fontSize: 44, fontWeight: 900, marginTop: 8, color: tone === "dark" ? "#fff" : "#111" }}>
        {value}
      </div>
      {sub ? <div style={{ marginTop: 6, opacity: 0.75, fontWeight: 700 }}>{sub}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null); // U21 | NT

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

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
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      const u = urows[0];
      if (!u.team_type) {
        setAccess("denied");
        return;
      }

      setRole(u.role || "user");
      setTeamType(u.team_type);
      setAccess("ok");
    })();
  }, []);

  async function fetchPlayers() {
    if (!teamType) return;
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      .select(
        "id, full_name, position, team_type, status, ht_age_years, ht_age_days, u21_status, last_seen_at"
      )
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok") fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, teamType]);

  const staff = useMemo(() => (teamType ? STAFF[teamType] : null), [teamType]);

  // KPI (MVP: iz baze + placeholder logike)
  const stats = useMemo(() => {
    const total = rows.length;

    const core = rows.filter((r) => r.status === "core").length;
    const rotation = rows.filter((r) => r.status === "rotation").length;
    const watch = rows.filter((r) => r.status === "watch").length;
    const risk = rows.filter((r) => r.status === "risk").length;

    // U21: “ispali” = u21_status === 'ispao' (ako postoji) ili ht_age>21+111 placeholder
    const u21_out = rows.filter((r) => r.u21_status === "ispao").length;
    const u21_soon = rows.filter((r) => r.u21_status === "izlazi_uskoro").length;

    return { total, core, rotation, watch, risk, u21_out, u21_soon };
  }, [rows]);

  const quick = useMemo(() => rows.slice(0, 8), [rows]);

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Nemaš pristup.</h2>
          <p>Prijavi se s odobrenim emailom ili kontaktiraj admina.</p>
          <Link href="/login">→ Prijava</Link>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Hrvatski U21/NT Tracker"
      subtitle="Selektorski panel • Scouting • U21/NT"
      activeTeamLabel={staff?.teamLabel || null}
    >
      {/* staff bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            Aktivni tim: <span style={{ color: "#b91c1c" }}>{staff?.teamLabel}</span>
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Izbornik: <b>{staff?.coach}</b> · Pomoćnik: <b>{staff?.assistant}</b>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Ulogiran: <b>{email}</b> · Uloga: <b>{role}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/players" style={btnPrimary}>
            Igrači →
          </Link>
          <Link href="/requests" style={btnSoft}>
            Zahtjevi
          </Link>
          <Link href="/lists" style={btnSoft}>
            Popisi
          </Link>
          <Link href="/alerts" style={btnSoft}>
            Upozorenja
          </Link>
          <Link href="/training-settings" style={btnSoft}>
            Postavke treninga
          </Link>
          <Link href="/clubs" style={btnSoft}>
            Klubovi
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Card title="Ukupno igrača" value={stats.total} sub="u bazi (tvoj tim)" tone="neutral" />
        <Card title="Core" value={stats.core} sub="glavna jezgra" tone="good" />
        <Card title="Watch" value={stats.watch} sub="za praćenje" tone="neutral" />
        <Card title="Risk" value={stats.risk} sub="kritični / rizik" tone="bad" />
      </div>

      {/* U21-only block */}
      {teamType === "U21" ? (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
              Kritična upozorenja (U21)
            </div>

            <div style={warnRow}>
              <b>Izlaze uskoro:</b> {stats.u21_soon}
              <span style={{ opacity: 0.7, marginLeft: 8 }}>(placeholder dok ne uvedemo punu HT logiku)</span>
            </div>
            <div style={warnRow}>
              <b>Ispali:</b> {stats.u21_out}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Sljedeće: “U21 ciklus: tko može do finala” računamo po HT tjednima i datumu finala (iz CHPP sync-a).
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #111827", borderRadius: 16, padding: 14, color: "#fff" }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
              Trening alarmi (skeleton)
            </div>
            <div style={{ opacity: 0.9, lineHeight: 1.4 }}>
              U V1 (dok čekamo CHPP) ovo je “placeholder”:
              <ul style={{ marginTop: 8 }}>
                <li>za svakog igrača spremamo ciljane skillove (kasnije)</li>
                <li>računamo odstupanje od idealnog treninga (kasnije formula)</li>
                <li>generiramo upozorenja skautovima (alerts)</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* NT-only note */}
      {teamType === "NT" ? (
        <div style={{ marginTop: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Napomena (NT)</div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            NT dashboard nema U21 kalkulator / U21 ciklus. Fokus: forma, status, napredak, trening alarmi (kasnije), klub/coach info (kasnije CHPP).
          </div>
        </div>
      ) : null}

      {/* Quick table */}
      <div style={{ marginTop: 14, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #eee" }}>
          Pregled igrača (brzi rez) {loadingPlayers ? " · učitavam..." : ""}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Ime</th>
              <th style={th}>Poz</th>
              <th style={th}>Dob (HT)</th>
              <th style={th}>Status</th>
              {teamType === "U21" ? <th style={th}>U21</th> : null}
            </tr>
          </thead>
          <tbody>
            {quick.map((p) => (
              <tr key={p.id}>
                <td style={tdStrong}>{p.full_name}</td>
                <td style={td}>{p.position || "-"}</td>
                <td style={td}>
                  {p.ht_age_years != null && p.ht_age_days != null
                    ? `${p.ht_age_years}g (${p.ht_age_days}d)`
                    : "-"}
                </td>
                <td style={td}>
                  <span style={badge(p.status)}>{p.status || "watch"}</span>
                </td>
                {teamType === "U21" ? <td style={td}>{p.u21_status || "-"}</td> : null}
              </tr>
            ))}
            {!loadingPlayers && quick.length === 0 ? (
              <tr>
                <td colSpan={teamType === "U21" ? 5 : 4} style={{ padding: 14, opacity: 0.75 }}>
                  Nema igrača u bazi. Dodaj ih na “Igrači”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div style={{ padding: 12 }}>
          <Link href="/players" style={btnPrimary}>Vidi sve igrače →</Link>
        </div>
      </div>
    </AppLayout>
  );
}

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 900,
};

const btnSoft = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  textDecoration: "none",
  fontWeight: 900,
  color: "#111",
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };

const warnRow = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #fee2e2",
  background: "#fef2f2",
  marginBottom: 10,
};

function badge(status) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const b = map[status] || map.watch;
  return {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 10,
    background: b.bg,
    color: b.fg,
    fontWeight: 900,
  };
}
