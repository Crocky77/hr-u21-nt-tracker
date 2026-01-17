import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { supabase } from "../utils/supabaseClient";

export default function AppLayout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
      } catch (e) {
        if (!mounted) return;
        setSession(null);
      } finally {
        if (!mounted) return;
        setAuthReady(true);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const showLoggedIn = authReady && !!session;

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (e) {
      alert("Odjava trenutno ne radi. Probaj refresh ili ponovno kasnije.");
    }
  }

  return (
    <div className={isHome ? "hr-homeBg" : "hr-appBg"}>
      <header className="hr-topbar hr-topbarLight">
        <div>
          <div className="hr-brand">Hrvatski U21/NT Tracker</div>
          <div className="hr-subbrand">Interni tracker · skauting · liste · upozorenja</div>
        </div>

        <div className="hr-topbarRight">
          <Link className="hr-pillBtn hr-pillBtnLight" href="/">
            Naslovnica
          </Link>

          {showLoggedIn ? (
            <>
              <span className="hr-userPill hr-userPillLight">Prijavljen</span>
              <button className="hr-pillBtn hr-pillBtnLight" type="button" onClick={handleLogout}>
                Odjava
              </button>
            </>
          ) : (
            <Link className="hr-pillBtn hr-pillBtnPrimary" href="/login">
              Prijavi se
            </Link>
          )}
        </div>
      </header>

      <main className="hr-main">
        <div className="hr-container">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
