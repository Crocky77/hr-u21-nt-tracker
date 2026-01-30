import Link from "next/link";
import Image from "next/image";
import { useUser } from "../lib/useUser";

/**
 * Globalni Header (bez topbara)
 * - Lijevo: logo + title
 * - Desno: status prijave
 */
export default function Header() {
  const { user, userLabel, roleLabel, loading } = useUser();

  const statusText = (() => {
    if (loading) return "Provjera prijave...";
    if (!user) return "Nisi prijavljen";
    if (roleLabel) return `${userLabel} (${roleLabel})`;
    return `${userLabel}`;
  })();

  return (
    <header className="hr-siteHeader">
      <div className="hr-siteHeaderInner">
        <Link href="/" className="hr-siteHeaderLeft" style={{ textDecoration: "none" }}>
          <Image
            src="/logo.png"
            alt="Hrvatski U21/NT Tracker"
            width={52}
            height={52}
            priority
          />
          <div className="hr-siteHeaderTitle">Hrvatski U21 / NT Tracker</div>
        </Link>

        <div className="hr-siteHeaderRight">
          <div className="hr-siteHeaderStatus">{statusText}</div>
        </div>
      </div>
    </header>
  );
}
