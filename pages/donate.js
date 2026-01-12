import Link from "next/link";

export default function Donate() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#f6f7fb", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(90deg,#7f1d1d,#ef4444)", color: "#fff", padding: "18px 18px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Donacije</div>
            <div style={{ opacity: 0.9, fontSize: 12 }}>Podrži razvoj alata</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={btn()}>Naslovna</Link>
            <Link href="/about" style={btn()}>O alatu</Link>
            <Link href="/help" style={btn()}>Pomoć</Link>
            <Link href="/login" style={{ ...btn(), background: "#111", borderColor: "#111" }}>Prijava</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18, display: "grid", gap: 14 }}>
        <div style={card()}>
          <h1 style={{ margin: 0, color: "#b91c1c" }}>Zašto donacije?</h1>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            Donacije služe za održavanje infrastrukture i razvoj novih funkcija (CHPP integracija, trening formula,
            upozorenja, snapshot povijesti, napredni dashboard).
          </p>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            MVP: ovdje je placeholder. Kad odlučimo model (donacija/premium), ubacit ćemo link (npr. BuyMeACoffee / Boosty / PayPal).
          </div>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>Premium ideja (kasnije)</h2>
          <ul style={{ marginTop: 10, lineHeight: 1.6 }}>
            <li>više lista igrača</li>
            <li>napredniji training alarms</li>
            <li>više snapshot-a / povijest</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function btn() {
  return {
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  };
}

function card() {
  return { border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14 };
}
