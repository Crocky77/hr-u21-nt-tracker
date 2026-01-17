import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";
import { useAuth } from "../utils/useAuth";
import { maskEmail } from "../utils/privacy";

export default function AppLayout({ children }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isHome = router.pathname === "/";
  const rootClass = isHome ? "hr-homeBg" : "hr-appBg";

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("Greška pri odjavi.");
    }
  }

  return (
    <div className={rootClass}>
      <header className="hr-topbar">
        <div>
          <div className="hr-brand">Hrvatski U21/NT Tracker</div>
          <div className="hr-subbrand">Interni tracker · skauting · liste · upozorenja</div>
        </div>

        <div className="hr-topbarRight">
          <Link className="hr-pillBtn" href="/">
            Naslovnica
          </Link>

          {user?.email ? (
            <span className="hr-userPill" title="Prijavljen korisnik (maskirano)">
              {maskEmail(user.email)}
            </span>
          ) : null}

          {user ? (
            <button className="hr-pillBtn" onClick={handleSignOut} type="button">
              Odjava
            </button>
          ) : null}
        </div>
      </header>

      <main className="hr-main">{children}</main>

      <Footer />
    </div>
  );
}
