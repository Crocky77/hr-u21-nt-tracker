// pages/login.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

let supabase = null;
try {
  // eslint-disable-next-line import/no-unresolved
  supabase = require("../utils/supabaseClient").supabase;
} catch (e) {
  supabase = null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        if (!supabase?.auth?.getSession) return;

        const { data } = await supabase.auth.getSession();
        if (data?.session?.user && !cancelled) {
          router.replace("/");
        }
      } catch (e) {
        // ignore
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function sendMagicLink(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      if (!supabase?.auth?.signInWithOtp) {
        setMsg("Login nije konfiguriran (nema Supabase clienta).");
        setBusy(false);
        return;
      }

      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setMsg("Poslan je magic link na email. Otvori link i bit ćeš prijavljen.");
    } catch (err) {
      setMsg(err?.message || "Greška kod prijave.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      <div style={card}>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
          Prijava
        </div>
        <div style={{ opacity: 0.9, marginBottom: 14 }}>
          Upiši email. Dobit ćeš magic link za prijavu.
        </div>

        <form onSubmit={sendMagicLink} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tvoj@email.com"
            style={input}
            type="email"
            required
          />
          <button type="submit" disabled={busy} style={btn}>
            {busy ? "Šaljem..." : "Pošalji link"}
          </button>
        </form>

        {msg ? <div style={{ marginTop: 12, fontSize: 14 }}>{msg}</div> : null}

        <div style={{ marginTop: 14 }}>
          <a href="/" style={{ color: "#111", fontWeight: 900, textDecoration: "underline" }}>
            ← Natrag na naslovnicu
          </a>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.86)",
  border: "1px solid rgba(0,0,0,0.18)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
};

const input = {
  flex: "1 1 260px",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.22)",
  fontSize: 16,
};

const btn = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.25)",
  background: "rgba(0,0,0,0.88)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
