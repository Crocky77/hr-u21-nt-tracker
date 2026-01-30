// /lib/useUser.js
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * useUser() – mali helper hook za Header (i druge stranice)
 * - dohvat trenutnog usera
 * - live promjene auth state-a
 * - userLabel + roleLabel (MVP: role iz localStorage ili fallback)
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [roleLabel, setRoleLabel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getUser();
        if (!alive) return;

        if (error) {
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }

        // MVP role label (ako ga negdje spremate)
        try {
          const storedRole = window.localStorage.getItem('hr_tracker_role');
          if (storedRole) setRoleLabel(storedRole);
        } catch (_) {}
      } catch (_) {
        if (!alive) return;
        setUser(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    // auth promjene
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const userLabel = useMemo(() => {
    if (!user) return null;
    return user.user_metadata?.full_name || user.email || user.id;
  }, [user]);

  return { user, userLabel, roleLabel, loading };
}

// default export (da radi i ako je import default)
export default useUser;
