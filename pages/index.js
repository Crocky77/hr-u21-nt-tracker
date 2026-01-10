import Link from "next/link";

export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "#c00" }}>🇭🇷 Hrvatski U21 / NT Tracker</h1>
      <p>Status: sustav aktivan</p>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/login" style={{ padding: "10px 14px", borderRadius: 8, background: "#111", color: "#fff", textDecoration: "none" }}>
          Prijava
        </Link>
        <Link href="/u21-kalkulator" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", textDecoration: "none" }}>
          U21 kalkulator (demo)
        </Link>
      </div>
    </main>
  );
}
