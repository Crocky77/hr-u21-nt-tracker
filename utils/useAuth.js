// utils/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { safeUserLabel } from "./privacy";

// Vraca:
// { loading, isAuthed, user, label, email, role, teamType }
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // supabase user
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);

      // 1) user
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;

      if (!mounted) return;

      setUser(u);
      const e = u?.email ?? null;
      setEmail(e);

      // 2) role/team_type iz users tablice
      if (e) {
        const { data: rows, error } = await supabase
          .from("users")
          .select("role, team_type")
          .eq("email", e)
          .limit(1);

        if (!mounted) return;

        if (!error && rows && rows.length > 0) {
          setRole(rows[0].role || null);
          setTeamType(rows[0].team_type || null);
        } else {
          setRole(null);
          setTeamType(null);
        }
      } else {
        setRole(null);
        setTeamType(null);
      }

      setLoading(false);
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      boot();
    });

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe?.();
      } catch (e) {}
    };
  }, []);

  const label = safeUserLabel(user);

  return {
    loading,
    isAuthed: !!user,
    user,
    label,
    email,
    role,
    teamType
  };
}
