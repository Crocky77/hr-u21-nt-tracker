import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: "24px",
        padding: "16px 20px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        color: "rgba(0,0,0,0.70)",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "underline" }}>
            Uvjeti korištenja
          </Link>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>
            Politika privatnosti
          </Link>
        </div>

        <div style={{ textAlign: "right" }}>
          © {year} Hrvatski U21/NT Tracker — Sva prava pridržana. Zabranjeno kopiranje i dijeljenje bez
          dopuštenja.
        </div>
      </div>
    </footer>
  );
}
