import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";

export default function AppLayout({ children, title }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isHome ? "transparent" : "#f6f7f9", // svijetlo siva za čitljivost
        color: "#111",
      }}
    >
      {/* Top bar (minimalan, čitljiv) */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(15,15,15,0.92)",
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Hrvatski U21/NT Tracker</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>
              Interni tracker · skauting · liste · upozorenja
            </div>
          </div>

          <nav style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                color: "#fff",
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "12px",
              }}
            >
              Naslovnica
            </Link>

            {/* OVDJE NAMJERNO NE PRIKAZUJEMO EMAIL (privacy) */}
            <span
              style={{
                color: "rgba(255,255,255,0.90)",
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "12px",
              }}
              title="Korisnički identitet je skriven (privacy guard)"
            >
              Prijavljen
            </span>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isHome ? "0 16px 24px" : "18px 16px 24px",
        }}
      >
        {title ? (
          <h1 style={{ margin: "16px 0 12px", fontSize: "22px" }}>{title}</h1>
        ) : null}

        {children}

        {/* Footer (legal + links) */}
        <Footer />
      </main>
    </div>
  );
}
