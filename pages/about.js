import Link from "next/link";

export default function About() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#f6f7fb", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(90deg,#7f1d1d,#ef4444)", color: "#fff", padding: "18px 18px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Hrvatski U21/NT Tracker</div>
            <div style={{ opacity: 0.9, fontSize: 12 }}>Selektorski panel • Scouting • U21/NT</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={btn()}>Naslovna</Link>
            <Link href="/help" style={btn()}>Pomoć</Link>
            <Link href="/donate" style={btn()}>Donacije</Link>
            <Link href="/login" style={{ ...btn(), background: "#111", borderColor: "#111" }}>Prijava</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18, display: "grid", gap: 14 }}>
        <div style={card()}>
          <h1 style={{ margin: 0, color: "#b91c1c" }}>O alatu</h1>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            Ovaj tracker je privatni alat za rad HR U21 i HR NT selekcije: baze igrača, statusi, upozorenja i
            (uskoro) trening tracking s alarmima.
          </p>
          <ul style={{ lineHeight: 1.6 }}>
            <li><b>Igrači:</b> baza, statusi, bilješke.</li>
            <li><b>Dashboard:</b> pregled ključnih brojeva i “tko ispada / tko izlazi uskoro”.</li>
            <li><b>U21 status:</b> ciklus + eligibility do finala.</li>
            <li><b>Trening alarmi:</b> skeleton (kasnije CHPP sync + formula).</li>
            <li><b>Osoblje:</b> role po timu (coach/assistant/scout).</li>
          </ul>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Login je trenutno preko emaila (privremeno). Kad dobijemo licencu: prelazimo na Hattrick CHPP.
          </div>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>Kako radi update</h2>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            U V1 sve unosimo ručno (MVP) da se tim navikne na flow. Kad dođe CHPP:
            automatski povlačimo igrače, skillove/subskillove, formu, staminu, trening postavke i klub info.
          </p>
        </div>

        <div style={card()}>
          <h2 style={{ margin: 0 }}>Kontakt</h2>
          <p style={{ marginTop: 10, lineHeight: 1.5 }}>
            Ako želiš testirati ili prijaviti bug: javi se izborniku ili pomoćniku.
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
