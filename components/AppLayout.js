import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";

export default function AppLayout({ children, title }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <div className={isHome ? "hr-homeBg" : "hr-appBg"}>
      <header className="hr-topbar">
        <div>
          <div className="hr-brand">Hrvatski U21/NT Tracker</div>
          <div className="hr-subbrand">Interni tracker · skauting · liste · upozorenja</div>
        </div>

        <div className="hr-topbarRight">
          <Link className="hr-pillBtn" href="/">
            Naslovnica
          </Link>

          {/* MVP placeholder: umjesto emaila pokazujemo status */}
          <span className="hr-userPill">Prijavljen</span>

          {/* MVP placeholder (dok ne vežemo auth/logout): */}
          <button
            className="hr-pillBtn"
            type="button"
            onClick={() => alert("Odjava će doći kad spojimo auth flow (MVP).")}
          >
            Odjava
          </button>
        </div>
      </header>

      <main className="hr-main">
        <div className="hr-container">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
