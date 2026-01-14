// pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";

// Probamo Supabase signOut ako postoji supabaseClient.
// Ako ga nema (ili faila), fallback: probaj NextAuth signout endpoint.
let supabase = null;
try {
  // ako postoji u tvom projektu, ovo će raditi
  // eslint-disable-next-line import/no-unresolved
  supabase = require("../utils/supabaseClient").supabase;
} catch (e) {
  supabase = null;
}

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      try {
        if (supabase?.auth?.signOut) {
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback (ako koristiš NextAuth)
      window.location.href = "/api/auth/signout";
    }

    run();
  }, [router]);

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto", color: "#fff" }}>
      Odjava...
    </div>
  );
}
