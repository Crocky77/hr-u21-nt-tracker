import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hr-footerLite">
      <div className="hr-footerLiteInner">
        <div className="hr-footerLinks">
          <Link href="/about">O alatu</Link>
          <span className="hr-dot">•</span>
          <Link href="/help">Pomoć</Link>
          <span className="hr-dot">•</span>
          <Link href="/donate">Donacije</Link>
          <span className="hr-dot">•</span>
          <Link href="/privacy">Privacy</Link>
          <span className="hr-dot">•</span>
          <Link href="/terms">Terms</Link>
        </div>

        <div className="hr-footerCopy">
          © {year} Hrvatski U21/NT Tracker — Sva prava pridržana. Zabranjeno kopiranje i dijeljenje bez dopuštenja.
        </div>
      </div>
    </footer>
  );
}
