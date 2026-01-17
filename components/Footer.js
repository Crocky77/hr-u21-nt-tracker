import Link from "next/link";

export default function Footer() {
  return (
    <footer className="hr-footer">
      <div className="hr-footerInner">
        <div>© {new Date().getFullYear()} Hrvatski U21/NT Tracker · Interni alat za skauting i praćenje razvoja</div>

        <div>
          <Link className="hr-footerLink" href="/about">O alatu</Link>
          <span className="hr-dot"> · </span>
          <Link className="hr-footerLink" href="/help">Pomoć</Link>
          <span className="hr-dot"> · </span>
          <Link className="hr-footerLink" href="/donate">Donacije</Link>
          <span className="hr-dot"> · </span>
          <Link className="hr-footerLink" href="/privacy">Privacy</Link>
          <span className="hr-dot"> · </span>
          <Link className="hr-footerLink" href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
