import Link from "next/link";

export default function MyPlayersPlaceholder() {
  return (
    <div className="hr-container" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="hr-3dCard">
        <div className="hr-3dCardInner">
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 1000 }}>Moji igrači</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Ovdje će biti tvoja privatna stranica s igračima nakon CHPP prijave.
          </p>

          <div style={{ marginTop: 14, lineHeight: "1.5rem" }}>
            <div style={{ fontWeight: 900 }}>Kako će raditi (koncept):</div>
            <ul style={{ marginTop: 8 }}>
              <li>Klikneš “Prijava (CHPP)”</li>
              <li>Tracker preko CHPP-a učita tvoje igrače u bazu</li>
              <li>Otvori se tvoja privatna lista igrača (samo tebi vidljiva po pravilima/role)</li>
            </ul>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="hr-pillBtn"
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.9)",
                fontWeight: 900,
                cursor: "pointer",
              }}
              onClick={() => alert("CHPP licenca još nije aktivna. Ovdje će doći prijava čim licenca stigne.")}
            >
              Prijava (CHPP) — uskoro
            </button>

            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.9)",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              ← Natrag na naslovnicu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
