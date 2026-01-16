import Link from "next/link";
import { useRouter } from "next/router";

export default function AppLayout({ children, variant = "default" }) {
  const router = useRouter();

  const isHome = router.pathname === "/";
  const isU21 = router.asPath.startsWith("/team/u21");
  const isNT = router.asPath.startsWith("/team/nt");

  const ShellClass = variant === "home" ? "homeHero" : "shell";

  return (
    <div className={ShellClass}>
      <div className="topNav">
        <Link className={`pill ${isHome ? "pillActive" : ""}`} href="/">
          Naslovna
        </Link>
        <Link className={`pill ${isU21 ? "pillActive" : ""}`} href="/team/u21">
          Hrvatska U21
        </Link>
        <Link className={`pill ${isNT ? "pillActive" : ""}`} href="/team/nt">
          Hrvatska NT
        </Link>
      </div>

      <div className="container">{children}</div>
    </div>
  );
}
