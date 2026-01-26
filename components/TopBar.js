// components/TopBar.js
import Link from "next/link";

export default function TopBar() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 800 }}>HR U21/NT Tracker</span>
        <span style={{ opacity: 0.6, fontSize: 12 }}>TopBar</span>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 700, textDecoration: "none" }}>
          Naslovnica
        </Link>
        <Link
          href="/team/nt"
          style={{ fontWeight: 700, textDecoration: "none" }}
        >
          NT
        </Link>
        <Link
          href="/team/u21"
          style={{ fontWeight: 700, textDecoration: "none" }}
        >
          U21
        </Link>
      </div>
    </div>
  );
}
