// components/AppLayout.js
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "../utils/useAuth";

export default function AppLayout({ children, title }) {
  const router = useRouter();
  const { isLoggedIn, label } = useAuth();

  const activePath = router?.asPath || "/";

  const nav = [
    { href: "/", label: "Naslovna" },
    { href: "/team/u21", label: "Hrvatska U21" },
    { href: "/team/nt", label: "Hrvatska NT" }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.brand}>
          <div style={styles.brandTitle}>{title || "HR U21/NT Tracker"}</div>
          <div style={styles.brandSub}>
            {isLoggedIn ? `Prijavljen: ${label}` : "Gost (bez prijave)"}
          </div>
        </div>

        <div style={styles.nav}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                ...styles.navBtn,
                ...(activePath === n.href ? styles.navBtnActive : {})
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6"
  },
  topBar: {
    background: "rgba(255,255,255,0.92)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    padding: "14px 16px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 0.2
  },
  brandSub: {
    fontSize: 12,
    opacity: 0.75
  },
  nav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap"
  },
  navBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.06)",
    textDecoration: "none",
    color: "#111",
    fontWeight: 700,
    fontSize: 13
  },
  navBtnActive: {
    background: "#111",
    color: "white"
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "18px 16px"
  }
};
