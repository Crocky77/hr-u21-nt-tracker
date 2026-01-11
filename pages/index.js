import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [access, setAccess] = useState("loading"); // loading | denied | ok

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

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 40,
        maxWidth: 900,
        margin: "0 auto"
      }}
    >
      <h1 style={{ color: "#c00" }}>🇭🇷 HR Hrvatski U21 / NT Tracker</h1>

      {access === "loading" && <p>Provjera pristupa...</p>}

      {access === "denied" && (
        <>
          <p><strong>Nemaš pristup.</strong></p>
          <Link href="/login">→ Prijava</Link>
        </>
      )}

      {access === "ok" && (
        <>
          <p>Status: sustav aktivan</p>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10
            }}
          >
            <div><strong>Ulogiran:</strong> {email}</div>
            <div><strong>Uloga:</strong> {role}</div>

            <button
              onClick={logout}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Odjava
            </button>
          </div>

          {/* NAVIGACIJA */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              flexWrap: "wrap"
            }}
          >
            <Link
              href="/dashboard"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#111",
                color: "#fff",
                textDecoration: "none"
              }}
            >
              Dashboard
            </Link>

            <Link
              href="/players"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ccc",
                textDecoration: "none"
              }}
            >
              Igrači
            </Link>

            <Link
              href="/u21-kalkulator"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ccc",
                textDecoration: "none"
              }}
            >
              U21 kalkulator
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
