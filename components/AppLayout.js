import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";
import { useAuth } from "../utils/useAuth";
import { maskEmail } from "../utils/privacy";

export default function AppLayout({ children }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isHome = router.pathname === "/";

  // Privacy: nikad ne prikazuj email u UI
  const safeUserLabel = user?.email ? maskEmail(user.email) : "Gost";

  return (
    <div className={isHome ? "hr-homeBg" : "hr-appBg"}>
      {/* TOP BAR */}
      <header className="hr-topbar">
        <div className="hr-topbarLeft">
          <div className="hr-brand">Hrvatski U21/NT Tracker</div>
          <div className="hr-subbrand">Interni tracker · skauting · liste · upozorenja</div>
        </div>

        <nav className="hr-topbarRight">
          <Link className="hr-pillBtn" href="/">
            Naslovnica
          </Link>

          <span className="hr-userPill" title="Masked user (privacy)">
            {safeUserLabel}
          </span>

          <button
            className="hr-pillBtn"
            onClick={() => {
              try {
                signOut();
              } catch (e) {
                // silent
              }
              router.push("/");
            }}
          >
            Odjava
          </button>
        </nav>
      </header>

      {/* CONTENT */}
      <main className="hr-main">{children}</main>

      {/* FOOTER (always visible) */}
      <Footer />
    </div>
  );
}
