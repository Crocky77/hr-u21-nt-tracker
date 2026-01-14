// utils/useAuth.js
import { useEffect, useState } from "react";

let supabase = null;
try {
  // eslint-disable-next-line import/no-unresolved
  supabase = require("./supabaseClient").supabase;
} catch (e) {
  supabase = null;
}

export function useAuth() {
  const [state, setState] = useState({
    loading: true,
    loggedIn: false,
    userId: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!supabase?.auth?.getSession) {
          if (!cancelled) {
            setState({ loading: false, loggedIn: false, userId: "", email: "", role: "" });
          }
          return;
        }

        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;

        if (!user) {
          if (!cancelled) setState({ loading: false, loggedIn: false, userId: "", email: "", role: "" });
          return;
        }

        let role = "user";
        try {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.role) role = profile.role;
        } catch (e) {
          // ignore if not ready
        }

        if (!cancelled) {
          setState({
            loading: false,
            loggedIn: true,
            userId: user.id,
            email: user.email || "",
            role,
          });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, loggedIn: false, userId: "", email: "", role: "" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
