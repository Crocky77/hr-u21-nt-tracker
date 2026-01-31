import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "../lib/useUser";

export default function Header() {
  const router = useRouter();
  const { user, userLabel, roleLabel, loading } = useUser();

  const isHome = router.pathname === "/";

  const statusText = (() => {
    if (loading) return "Provjera prijave...";
    if (!user) return "Nisi prijavljen";
    if (roleLabel) return `${userLabel} (${roleLabel})`;
    return userLabel;
  })();

  return (
    <header
      className={`hr-siteHeader ${
        isHome ? "hr-header--home" : "hr-header--inner"
      }`}
    >
      <div className="hr-siteHeaderInner">
        <Link href="/" className="hr-siteHeaderLeft">
          <Image
            src="/logo.png"
            alt="Hrvatski U21/NT Tracker"
            width={64}
            height={64}
            priority
          />
          <div className="hr-siteHeaderTitle">
            Hrvatski U21 / NT Tracker
          </div>
        </Link>

        <div className="hr-siteHeaderRight">
          <div className="hr-siteHeaderStatus">{statusText}</div>
          {user ? (
            <Link href="/logout" className="hr-headerLogout">
              Logout
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
