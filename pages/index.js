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
  const [access, setAccess] = useState("unknown"); // unknown | ok | denied

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      setEmail(userEmail);

      if (!userEmail) {
        setAccess("denied");
        return;
      }

      // Povuci role iz tablice users
      const { data: rows, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      if (error || !rows || rows.length === 0) {
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
    <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "#c00" }}>🇭🇷 Hrvatski U21 / NT Tracker</h1>

      {access === "unknown" && <p>Provjera pristupa...</p>}

      {access === "denied" && (
        <>
          <p><strong>Nemaš pristup.</strong></p>
          <p>Prijavi se s odobrenim emailom ili kontaktiraj admina.</p>
          <Link href="/login">→ Prijava</Link>
        </>
      )}

      {access === "ok" && (
        <>
          <p>Status: sustav aktivan</p>
          <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            <div><strong>Ulogiran:</strong> {email}</div>
            <div><strong>Uloga:</strong> {role}</div>
            <button onClick={logout} style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, border: "none", background: "#111", color: "#fff" }}>
              Odjava
            </button>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <Link href="/u21-kalkulator" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", textDecoration: "none" }}>
              U21 kalkulator
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
