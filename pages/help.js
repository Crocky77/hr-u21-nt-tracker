import Link from "next/link";

export default function Help() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#f6f7fb", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(90deg,#7f1d1d,#ef4444)", color: "#fff", padding: "18px 18px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Pomoć</div>
            <div style={{ opacity: 0.9, fontSize: 12 }}>Brzi vodič za V1</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={btn()}>Naslovna</Link>
            <Link href="/about" style={btn()}>O alatu</Link>
            <Link href="/donate" style={btn()}>Donacije</Link>
            <Link href="/login" style={{ ...btn(), background: "#111", borderColor: "#111" }}>Prijava</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18, display: "grid", gap: 14 }}>
        <div style={card()}>
          <h2 style={{ margin: 0 }}>Role (V1)</h2>
          <ul style={{ lineHeight: 1.6, marginTop: 10 }}>
            <li><b>admin</b> – sve (tehnički nadzor u ovoj fazi)</li>
            <li><b>coach</b> – upravlja timom i osobljem (kasnije automatski preko CHPP)</li>
            <li><b>assistant</b> – uređuje unose u svom timu (kasnije finije ovlasti)</li>
            <li><b>head_scout</b> – pregled i koordinacija</li>
            <li><b>scout</b> – bilješke i praćenje</li>
          </ul>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>Igrači</h2>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            U V1 unosimo igrače ručno: ime, HT ID (opcionalno), pozicija, datum rođenja i status.
            Kasnije CHPP sync puni skillove/subskillove, formu, staminu, klub, trening.
          </p>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>U21 status</h2>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            Dashboard prikazuje: “ispali” i “izlaze uskoro” prema ciklusu. Cilj je brz pregled.
          </p>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>Trening alarmi</h2>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            Trenutno je skeleton (ideal/actual score). Kad dođe CHPP + formula:
            dobit ćemo automatski alarm “zaostaje za idealnim treningom” i notifikacije osoblju.
          </p>
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
