// components/AdminBadge.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- supabase client (uses NEXT public env vars) ---
const supabase =
  typeof window !== "undefined"
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export default function AdminBadge() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    (async () => {
      setLoading(true);
      const { data: s } = await supabase.auth.getSession();
      if (!active) return;
      setSession(s?.session ?? null);

      if (s?.session?.user) {
        // 1) probaj user_profiles (naš izvor istine)
        const { data: up } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", s.session.user.id)
          .maybeSingle();

        if (up?.role) {
          setRole(up.role);
        } else {
          // 2) fallback na users.role (ako postoji)
          const { data: u } = await supabase
            .from("users")
            .select("role")
            .eq("id", s.session.user.id)
            .maybeSingle();
          setRole(u?.role ?? null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    })();

    // realtime na promjene sesije
    const { data: sub } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
      if (!newSession?.user) {
        setRole(null);
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!session || loading) return null;

  const isAdmin = (role || "").toLowerCase() === "admin";

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 1000,
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        padding: "8px 12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        fontWeight: 700,
      }}
    >
      {isAdmin ? (
        <span style={{ whiteSpace: "nowrap" }}>Dobrodošao, admin</span>
      ) : (
        <span style={{ opacity: 0.7, whiteSpace: "nowrap" }}>Prijavljen</span>
      )}

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          // tvrdi refresh da UI odmah makne badge
          window.location.href = "/";
        }}
        style={{
          cursor: "pointer",
          whiteSpace: "nowrap",
          border: "1px solid rgba(0,0,0,0.12)",
          background: "white",
          borderRadius: 10,
          padding: "6px 10px",
          fontWeight: 900,
        }}
        aria-label="Odjava"
        title="Odjava"
      >
        Odjava
      </button>
    </div>
  );
}
