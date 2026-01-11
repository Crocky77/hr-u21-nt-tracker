import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function StatCard({ title, value, sub, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#fff", bd: "#e5e7eb" },
    warn: { bg: "#fff7ed", bd: "#fed7aa" },
    good: { bg: "#f0fdf4", bd: "#bbf7d0" }
  };
  const t = tones[tone] || tones.neutral;

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 10px 24px rgba(0,0,0,.08)"
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 44, fontWeight: 900, marginTop: 8 }}>{value}</div>
      <div style={{ marginTop: 8, opacity: 0.75, fontWeight: 700 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children, accent = "neutral" }) {
  const headerBg =
    accent === "danger"
      ? "linear-gradient(90deg,#b91c1c,#ef4444)"
      : accent === "info"
      ? "linear-gradient(90deg,#1f2937,#374151)"
      : "linear-gradient(90deg,#111827,#111827)";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(0,0,0,.08)"
      }}
    >
      <div style={{ padding: 14, color: "#fff", fontWeight: 900, background: headerBg }}>
        {title}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

export default function Home() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  // Demo values (kasnije iz baze/CHPP)
  const demo = {
    u21Active: 27,
    fallingOut: 6,
    topForm: [
      { name: "K. Jurić", v: "8" },
      { name: "M. Kovač", v: "8" },
      { name: "A. Babić", v: "8" }
    ],
    topProgress: [
      { name: "L. Petrović", v: "+2" },
      { name: "S. Radić", v: "+1.5" },
      { name: "T. Grgić", v: "+1" }
    ],
    alerts: [
      "Marko Šimić → ispada iz U21 za 3 tjedna",
      "Ivan Horvat → slaba forma, stagnacija",
      "Potražiti novog CB za idući ciklus!"
    ],
    table: [
      { name: "Marko Šimić", pos: "DEF", age: "22g (78d)", status: "Zadnja sezona", icon: "❗" },
      { name: "Ivan Horvat", pos: "GK", age: "21g (110d)", status: "U21", icon: "⚠️" },
      { name: "Luka Vidić", pos: "MID", age: "20g (250d)", status: "Potencijal", icon: "⭐" }
    ]
  };

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

  const isLoggedIn = access === "ok";

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(239,68,68,.25), transparent 60%), radial-gradient(1000px 500px at 80% 10%, rgba(185,28,28,.18), transparent 55%), linear-gradient(#f8fafc,#f1f5f9)"
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          background: "linear-gradient(90deg,#b91c1c,#ef4444)",
          color: "#fff",
          padding: "16px 0",
          boxShadow: "0 10px 26px rgba(0,0,0,.18)"
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,.18)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                border: "1px solid rgba(255,255,255,.25)"
              }}
              title="Grb (privremeno)"
            >
              HR
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>
                Hrvatski U21/NT Tracker
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Selektorski panel • Skauting • U21/NT
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!isLoggedIn ? (
              <Link
                href="/login"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.16)",
                  border: "1px solid rgba(255,255,255,.25)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 900
                }}
              >
                Prijava →
              </Link>
            ) : (
              <>
                <div style={{ fontWeight: 900, opacity: 0.95 }}>
                  Dobrodošli, <span style={{ textDecoration: "underline" }}>{email}</span>
                </div>
                <div style={{ opacity: 0.9, fontWeight: 800 }}>({role})</div>

                <Link
                  href="/"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.25)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900
                  }}
                >
                  Naslovna
                </Link>

                <Link
                  href="/dashboard"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.25)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  href="/players"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.25)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900
                  }}
                >
                  Igrači
                </Link>

                <Link
                  href="/u21-kalkulator"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.25)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900
                  }}
                >
                  U21 kalkulator
                </Link>

                <button
                  onClick={logout}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.25)",
                    background: "rgba(17,24,39,.95)",
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer"
                  }}
                >
                  Odjava
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px 40px" }}>
        {!isLoggedIn ? (
          <div
            style={{
              marginTop: 18,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 10px 28px rgba(0,0,0,.08)"
            }}
          >
            <h2 style={{ margin: 0, color: "#111827" }}>Prijavi se da uđeš u alat</h2>
            <p style={{ marginTop: 8, opacity: 0.8 }}>
              Ovaj tracker je namijenjen HR U21 i NT timu. Prijava je trenutno preko emaila (privremeno), a kasnije ide preko Hattrick CHPP.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 12,
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 900
              }}
            >
              Prijava →
            </Link>
          </div>
        ) : (
          <>
            {/* Top cards */}
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
              <StatCard title="Aktivni U21 igrači" value={demo.u21Active} sub="4 u startnoj postavi" tone="good" />
              <StatCard title="Igrači ispadaju" value={demo.fallingOut} sub="2 zadnja sezona!" tone="warn" />

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 10px 24px rgba(0,0,0,.08)"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.8 }}>Top forma</div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {demo.topForm.map((x) => (
                    <div key={x.name} style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
                      <span>{x.name}</span>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 10,
                          background: "#16a34a",
                          color: "#fff"
                        }}
                      >
                        {x.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 10px 24px rgba(0,0,0,.08)"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.8 }}>Najveći napredak</div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {demo.topProgress.map((x) => (
                    <div key={x.name} style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
                      <span>{x.name}</span>
                      <span style={{ color: x.v.startsWith("+") ? "#16a34a" : "#111827" }}>{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lower panels */}
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Panel title="⚠️ Kritična upozorenja" accent="danger">
                <div style={{ display: "grid", gap: 10 }}>
                  {demo.alerts.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 12,
                        background: "#fff5f5",
                        fontWeight: 800
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Pregled igrača (brzi rez)" accent="info">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                        <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Ime</th>
                        <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Pozicija</th>
                        <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Dob</th>
                        <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
                        <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {demo.table.map((r) => (
                        <tr key={r.name}>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>{r.name}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.pos}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.age}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>{r.status}</td>
                          <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.icon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Link
                    href="/players"
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "#1d4ed8",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 900
                    }}
                  >
                    Vidi sve igrače →
                  </Link>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                  * Ovo su demo podaci (dok ne uđemo u CHPP sync). “Vidi sve igrače” je stvarna lista iz baze.
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
