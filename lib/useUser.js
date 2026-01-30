// lib/useUser.js
import { useEffect, useState } from "react";

// Očekujemo da već postoji: lib/supabaseClient.js
// (ako je kod tebe drugačije, javi pa prilagodim, ali prvo riješimo build)
import { supabase } from "./supabaseClient";

/**
 * Minimalni hook da Header može dobiti user-a bez rušenja builda.
 * Vraća:
 * - user (ili null)
 * - loading (true/false)
 */
export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        if (!supabase?.auth) {
          if (!alive) return;
          setUser(null);
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (!alive) return;

        setUser(data?.user ?? null);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setUser(null);
        setLoading(false);
      }
    }

    load();

    // live promjene (login/logout)
    const { data: sub } = supabase?.auth?.onAuthStateChange?.((_event, session) => {
      setUser(session?.user ?? null);
    }) ?? { data: null };

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { user, loading };
}
