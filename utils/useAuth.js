import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../utils/useAuth";
import { safeUserLabel } from "../utils/privacy";

export default function AppLayout({ children }) {
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const userLabel = safeUserLabel(user, role);

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-left">
            <Link href="/">
              <a className="app-title">Hrvatski U21 / NT Tracker</a>
            </Link>
          </div>

          <div className="app-center">
            <Link href="/">
              <a className={router.pathname === "/" ? "nav active" : "nav"}>
                Naslovna
              </a>
            </Link>
            <Link href="/team/u21">
              <a
                className={
                  router.pathname.startsWith("/team/u21") ? "nav active" : "nav"
                }
              >
                Hrvatska U21
              </a>
            </Link>
            <Link href="/team/nt">
              <a
                className={
                  router.pathname.startsWith("/team/nt") ? "nav active" : "nav"
                }
              >
                Hrvatska NT
              </a>
            </Link>
          </div>

          <div className="app-right">
            {user ? (
              <>
                <span className="user-label">{userLabel}</span>
                <button className="btn-logout" onClick={logout}>
                  Odjava
                </button>
              </>
            ) : (
              <Link href="/login">
                <a className="btn-login">Prijava</a>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="app-content">{children}</main>
    </div>
  );
}
