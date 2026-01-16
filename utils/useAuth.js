// utils/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { safeUserLabel } from "./privacy";

// Hook koji stranice mogu koristiti bez da ikad prikazu email.
export function useAuth({ requireAuth = false } = {}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [label, setLabel] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;

      if (!mounted) return;
      setUser(u);
      setLabel(u ? safeUserLabel(u) : null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLabel(u ? safeUserLabel(u) : null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return { loading, user, label, logout };
}

// Kompatibilnost za stare importe:
// import { useAuth } from "../utils/useAuth"
export default useAuth;
