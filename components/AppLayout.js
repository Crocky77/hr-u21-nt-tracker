import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function AppLayout({ title = "Hrvatski U21/NT Tracker", children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn("getSession error:", error);
        if (!mounted) return;

        setSession(data?.session ?? null);
      } catch (e) {
        console.warn("getSession exception:", e);
        if (!mounted) return;
        setSession(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // session će se sam osvježiti preko onAuthStateChange
      window.location.href = "/login";
    } catch (e) {
      console.warn("signOut exception:", e);
      window.location.href = "/login";
    }
  };

  const isLoggedIn = !!session?.user;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* HEADER */}
      <div
        style={{
          background: "#b1242a",
          color: "white",
          padding: "18px 16px",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
              Hrvatski U21/NT Tracker
            </div>
            <div style={{ opacity: 0.9, marginTop: 4 }}>
              Selektorski panel · Scouting · U21/NT
            </div>
          </div>

          {/* DESNI GUMB: PRIJAVA/ODJAVA */}
          <div>
            {/* Dok se auth učitava, ne prikazujemo krivi gumb */}
            {authLoading ? null : isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "#121212",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Odjava
              </button>
            ) : (
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  background: "#121212",
                  color: "white",
                  borderRadius: 14,
                  padding: "10px 16px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Prijava
              </Link>
            )}
          </div>
        </div>

        {/* TOP NAV (ostaje isto, samo linkovi) */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Naslovna
          </Link>

          <Link
            href="/about"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            O alatu
          </Link>

          <Link
            href="/help"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Pomoć
          </Link>

          <Link
            href="/donate"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Donacije
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: 18 }}>{children}</div>
    </>
  );
}
