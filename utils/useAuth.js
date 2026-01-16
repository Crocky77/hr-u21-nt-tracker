// utils/useAuth.js
import { useEffect, useMemo, useState } from "react";
import supabase from "./supabaseClient";
import { safeUserLabel } from "./privacy";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session || null);
        setUser(data?.session?.user || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[useAuth] getSession failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession || null);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const label = useMemo(() => safeUserLabel(user), [user]);

  return { session, user, loading, label, isLoggedIn: !!user };
}

export default useAuth;
