import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hr-footer">
      <div className="hr-container">
        <div className="hr-footerInner">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="hr-footerLink" href="/about">
              O alatu
            </Link>
            <span className="hr-dot">•</span>
            <Link className="hr-footerLink" href="/help">
              Pomoć
            </Link>
            <span className="hr-dot">•</span>
            <Link className="hr-footerLink" href="/donate">
              Donacije
            </Link>
            <span className="hr-dot">•</span>
            <Link className="hr-footerLink" href="/privacy">
              Privacy
            </Link>
            <span className="hr-dot">•</span>
            <Link className="hr-footerLink" href="/terms">
              Terms
            </Link>
          </div>

          <div style={{ textAlign: "right" }}>
            © {year} Hrvatski U21/NT Tracker — Sva prava pridržana. Zabranjeno kopiranje i dijeljenje
            bez dopuštenja.
          </div>
        </div>
      </div>
    </footer>
  );
}
