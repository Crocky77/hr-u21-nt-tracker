import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="hr-footer">
      <div className="hr-footerInner">
        <div className="hr-footerLeft">
          <span>© {new Date().getFullYear()} Hrvatski U21/NT Tracker</span>
          <span className="hr-footerDot">·</span>
          <span>Interni alat za skauting i praćenje razvoja</span>
        </div>

        <div className="hr-footerRight">
          <Link className="hr-footerLink" href="/terms">
            Uvjeti korištenja
          </Link>
          <span className="hr-footerSep">|</span>
          <Link className="hr-footerLink" href="/privacy">
            Politika privatnosti
          </Link>
        </div>
      </div>
    </footer>
  );
}
