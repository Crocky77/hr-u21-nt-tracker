import Link from 'next/link';
import { useRouter } from 'next/router';

function TopNav() {
  return (
    <nav className="topnav" aria-label="Glavna navigacija">
      <div className="topnav-inner">
        <Link className="topnav-link" href="/">
          Naslovna
        </Link>
        <Link className="topnav-link" href="/team/u21">
          Hrvatska U21
        </Link>
        <Link className="topnav-link" href="/team/nt">
          Hrvatska NT
        </Link>
      </div>
    </nav>
  );
}

export default function AppLayout({ children }) {
  const router = useRouter();

  // asPath je pouzdan za "/" (i kad ima query string)
  const isHome = router.asPath === '/' || router.pathname === '/';

  return (
    <div className={isHome ? 'app app-home' : 'app app-light'}>
      <TopNav />
      <main className={isHome ? 'page page-home' : 'page page-light'}>
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
