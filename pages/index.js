import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? null);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "#c00" }}>🇭🇷 Hrvatski U21 / NT Tracker</h1>
      <p>Status: sustav aktivan</p>

      <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        {email ? (
          <>
            <div><strong>Ulogiran:</strong> {email}</div>
            <button onClick={logout} style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, border: "none", background: "#111", color: "#fff" }}>
              Odjava
            </button>
          </>
        ) : (
          <div><strong>Nisi ulogiran</strong></div>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/login" style={{ padding: "10px 14px", borderRadius: 8, background: "#111", color: "#fff", textDecoration: "none" }}>
          Prijava
        </Link>
        <Link href="/u21-kalkulator" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", textDecoration: "none" }}>
          U21 kalkulator (demo)
        </Link>
      </div>
    </main>
  );
}
