import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        width: "100%",
        marginTop: 18,
        padding: "14px 16px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          © {year} HR U21/NT Tracker — <b>Sva prava pridržana.</b> Zabranjeno kopiranje,
          dijeljenje i distribucija bez pisanog dopuštenja autora.
        </div>

        <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
          <Link href="/privacy" style={{ textDecoration: "underline" }}>
            Privatnost
          </Link>
          <Link href="/terms" style={{ textDecoration: "underline" }}>
            Uvjeti korištenja
          </Link>
        </div>
      </div>
    </footer>
  );
}
