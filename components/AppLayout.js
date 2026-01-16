import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";
import { useAuth } from "../utils/useAuth";
import { safeUserLabel } from "../utils/privacy";

export default function AppLayout({ title, team, children }) {
  const router = useRouter();
  const { user, role, signOut } = useAuth();

  const teamFromRoute = router?.query?.team;
  const activeTeam = team || teamFromRoute; // "u21" ili "nt"
  const isLoggedIn = !!user;

  const userLabel = safeUserLabel(user);

  const goHome = () => router.push("/");
  const goU21 = () => router.push("/team/u21");
  const goNT = () => router.push("/team/nt");

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "18px 12px",
      }}
    >
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            borderRadius: 16,
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(0,0,0,0.08)",
            padding: "14px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={goHome}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Naslovna
              </button>

              <button
                type="button"
                onClick={goU21}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: activeTeam === "u21" ? "rgba(0,0,0,0.06)" : "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Hrvatska U21
              </button>

              <button
                type="button"
                onClick={goNT}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: activeTeam === "nt" ? "rgba(0,0,0,0.06)" : "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Hrvatska NT
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* User badge */}
              <div
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
                title="Privacy-guard: email se ne prikazuje"
              >
                {isLoggedIn ? (
                  <>
                    Prijavljen: <b>{userLabel}</b>
                    {role ? <span style={{ opacity: 0.8 }}> ({role})</span> : null}
                  </>
                ) : (
                  <>
                    Gost: <b>Preview</b>
                  </>
                )}
              </div>

              {/* Auth buttons */}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signOut();
                      router.push("/");
                    } catch (e) {
                      // namjerno tiho: ne želimo leakati detalje u UI
                      router.push("/");
                    }
                  }}
                  style={{
                    borderRadius: 999,
                    padding: "8px 12px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Odjava
                </button>
              ) : (
                <Link
                  href="/login"
                  style={{
                    borderRadius: 999,
                    padding: "8px 12px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Prijava
                </Link>
              )}
            </div>
          </div>

          {/* Page title */}
          {title ? (
            <div style={{ marginTop: 10 }}>
              <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
            </div>
          ) : null}

          {/* Quick links row */}
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/about" style={{ textDecoration: "underline", fontSize: 13 }}>
              O alatu
            </Link>
            <Link href="/help" style={{ textDecoration: "underline", fontSize: 13 }}>
              Pomoć
            </Link>
            <Link href="/donate" style={{ textDecoration: "underline", fontSize: 13 }}>
              Donacije
            </Link>
          </div>
        </div>

        {/* Content */}
        <main style={{ marginTop: 14 }}>{children}</main>

        {/* Footer (Task 4) */}
        <Footer />
      </div>
    </div>
  );
}
