import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// HT konstante
const HT_DAYS_PER_WEEK = 7;
const HT_DAYS_PER_YEAR = 112;
const U21_LIMIT_TOTAL = 21 * HT_DAYS_PER_YEAR + 111; // 2463
const SEASON_WEEKS = 16;

function totalToAgeStr(totalDays) {
  // clamp ispod 0
  const t = Math.max(0, totalDays);
  const y = Math.floor(t / HT_DAYS_PER_YEAR);
  const d = t % HT_DAYS_PER_YEAR;
  return `${y}g ${d}d`;
}

function absWeek(season, week) {
  return season * SEASON_WEEKS + week;
}

export default function U21Status() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  // “danas” (trenutna sezona/tjedan) - ručno za V1
  const [currentSeason, setCurrentSeason] = useState(93);
  const [currentWeek, setCurrentWeek] = useState(6);

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

  async function fetchCycle() {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("cycle_matches")
      .select("id, team_type, season, week, match_label, match_date, stage, abs_week")
      .eq("team_type", "U21")
      .order("abs_week", { ascending: true });

    if (!error && data) setRows(data);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok") fetchCycle();
  }, [access]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  const computed = useMemo(() => {
    const curAbs = absWeek(Number(currentSeason), Number(currentWeek));

    return rows.map((r) => {
      const weeksUntil = r.abs_week - curAbs; // može biti i 0 ili negativno (prošlo)
      const maxAgeTodayTotal = U21_LIMIT_TOTAL - weeksUntil * HT_DAYS_PER_WEEK;

      return {
        ...r,
        weeksUntil,
        maxAgeTodayStr: totalToAgeStr(maxAgeTodayTotal),
        maxAgeTodayTotal
      };
    });
  }, [rows, currentSeason, currentWeek]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>U21 status</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
          <h1 style={{ margin: "6px 0 0", color: "#c00" }}>U21 status (ciklus)</h1>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
            Ulogiran: <strong>{email}</strong> · Uloga: <strong>{role}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            Naslovna
          </Link>
          <Link href="/dashboard" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link href="/players" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            Igrači
          </Link>
          <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
            Odjava
          </button>
        </div>
      </div>

      {/* Kontrole */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 900 }}>Trenutno:</span>
          <input
            type="number"
            value={currentSeason}
            onChange={(e) => setCurrentSeason(e.target.value)}
            style={{ width: 90, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <input
            type="number"
            value={currentWeek}
            onChange={(e) => setCurrentWeek(e.target.value)}
            style={{ width: 70, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <span style={{ fontSize: 12, opacity: 0.7 }}>(sezona / tjedan)</span>
        </div>

        <button
          onClick={fetchCycle}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Osvježi ciklus
        </button>
      </div>

      {/* Tablica */}
      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          U21 ciklus {loadingRows ? "(učitavam...)" : `(${computed.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Sez/Tj</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Datum</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Utakmica</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Tjedana do</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Max age today</th>
            </tr>
          </thead>

          <tbody>
            {computed.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                  {r.season}/{r.week}
                </td>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  {r.match_date || "—"}
                </td>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  {r.match_label}
                </td>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  {r.weeksUntil}
                </td>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                  {r.maxAgeTodayStr}
                </td>
              </tr>
            ))}

            {!loadingRows && computed.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 14, opacity: 0.75 }}>
                  Nema matchova u cycle_matches za U21.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Formula: <strong>Max age today = 21g111d − (tjedana do utakmice × 7d)</strong>.  
        (Točno kao na hattrickportal trackeru.)
      </div>
    </main>
  );
}
