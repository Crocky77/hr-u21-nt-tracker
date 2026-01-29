import Link from "next/link";
import { useRouter } from "next/router";

export default function TopBar() {
  const router = useRouter();

  const isActive = (href) => router.pathname === href;

  return (
    <header className="topbar">
      <div className="topbar__left">
        <Link href="/" className="topbar__brand" aria-label="Naslovnica">
          <img
            src="/logo.png"
            alt="HR U21/NT Tracker"
            className="topbar__logo"
          />
          <span className="topbar__title">HRVATSKI U21 / NT TRACKER</span>
        </Link>
      </div>

      <nav className="topbar__nav" aria-label="Glavna navigacija">
        <Link
          href="/"
          className={`topbar__link ${isActive("/") ? "is-active" : ""}`}
        >
          Naslovnica
        </Link>
        <Link href="/team/nt" className="topbar__link">
          NT
        </Link>
        <Link href="/team/u21" className="topbar__link">
          U21
        </Link>
      </nav>
    </header>
  );
}
