// pages/index.js
import Link from "next/link";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsLoggedIn(!!data?.session?.user);
      setAuthLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AppLayout title="Hrvatski U21/NT Tracker">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                background:
                  "linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #b1242a 50%, #b1242a 100%)",
              }}
              title="HR motiv"
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.9) 0 10px, rgba(177,36,42,0.9) 10px 20px)",
                }}
              />
            </div>

            <div style={{ flex: "1 1 420px" }}>
              <h1 style={{ margin: 0 }}>Hrvatski U21/NT Tracker</h1>
              <p style={{ margin: "8px 0 0", opacity: 0.85, lineHeight: 1.4 }}>
                Javni pregled alata za praćenje hrvatskih reprezentativaca (U21 i NT).
                <br />
                <b>Gost</b> može vidjeti strukturu i dashboard “preview”, ali <b>igrači i skilovi</b> su dostupni samo prijavljenima.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {authLoading ? null : isLoggedIn ? (
                <span
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "#ecfeff",
                    border: "1px solid #a5f3fc",
                    fontWeight: 800,
                  }}
                >
                  Prijavljen si ✅
                </span>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900,
                  }}
                >
                  Prijava
                </Link>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Link
            href="/team/u21/dashboard"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #fff5f5 60%, #ffe4e6 100%)",
              color: "#111",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 800 }}>U21</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Dashboard U21</div>
            <div style={{ marginTop: 8, opacity: 0.85 }}>
              Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
            </div>
          </Link>

          <Link
            href="/team/nt/dashboard"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%)",
              color: "#111",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 800 }}>NT</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Dashboard NT</div>
            <div style={{ marginTop: 8, opacity: 0.85 }}>
              Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
            </div>
          </Link>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Link
            href="/about"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 14,
              background: "#fff",
              color: "#111",
              fontWeight: 800,
            }}
          >
            O alatu →
          </Link>
          <Link
            href="/help"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 14,
              background: "#fff",
              color: "#111",
              fontWeight: 800,
            }}
          >
            Pomoć →
          </Link>
          <Link
            href="/donate"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 14,
              background: "#fff",
              color: "#111",
              fontWeight: 800,
            }}
          >
            Donacije →
          </Link>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
          Napomena: u V1 gost vidi “preview” dashboarda, ali sve stranice koje prikazuju igrače/skilove traže prijavu.
        </div>
      </div>
    </AppLayout>
  );
}
