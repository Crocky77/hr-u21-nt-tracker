import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Šaljem login link...");

const { error } = await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${window.location.origin}/` }
});

    if (error) setMsg("Greška: " + error.message);
    else setMsg("Poslan je login link na email. Otvori ga i vratit će te na tracker.");
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ color: "#c00" }}>Prijava</h1>
      <p>Unesi email i dobit ćeš link za prijavu.</p>

      <form onSubmit={handleLogin} style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tvoj@email.com"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button style={{ padding: "10px 14px", borderRadius: 8, background: "#111", color: "#fff", border: "none" }}>
          Pošalji
        </button>
      </form>

      <p style={{ marginTop: 12 }}>{msg}</p>

      <p style={{ marginTop: 24 }}>
        <Link href="/">← Natrag</Link>
      </p>
    </main>
  );
}
