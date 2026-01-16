// pages/index.js
import Link from "next/link";
import HrCard from "../components/HrCard";

export default function Home() {
  return (
    <div className="hr-home">
      <div className="hr-homeBg">
        <img src="/backgrounds/hr-hero.jpg" alt="HR hero background" />
      </div>
      <div className="hr-homeShade" />

      <div className="hr-homeContent">
        <div className="hr-homeCenter">
          {/* NEMA gornja 3 linka na naslovnici (po tvom zahtjevu) */}

          <div className="hr-homeModules">
            <header className="hr-header hr-headerAccentGlobal" style={{ marginBottom: 14 }}>
              <div className="hr-headerRow">
                <div>
                  <h1 className="hr-title">Hrvatski U21/NT Tracker</h1>
                  <p className="hr-subtitle">
                    Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
                  </p>
                </div>
                <div className="hr-actions">
                  <Link className="hr-btn" href="/team/u21">
                    Hrvatska U21
                  </Link>
                  <Link className="hr-btn" href="/team/nt">
                    Hrvatska NT
                  </Link>
                </div>
              </div>
            </header>

            <div className="hr-header hr-headerAccentGlobal" style={{ marginBottom: 14 }}>
              <div className="hr-headerRow">
                <div>
                  <h2 className="hr-title" style={{ fontSize: 22, margin: 0 }}>
                    Moji igrači u Hrvatskom trackeru
                  </h2>
                  <p className="hr-subtitle">
                    CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači” u globalnom trackeru.
                  </p>
                </div>
                <div className="hr-actions">
                  <button className="hr-btn hr-btnPrimary" disabled>
                    Prijava (CHPP kasnije)
                  </button>
                </div>
              </div>
            </div>

            <div className="hr-grid">
              <HrCard
                title="Hrvatska U21"
                description="Pregled modula (preview). Igrači i skillovi su zaključani bez prijave."
                badge="Preview"
                href="/team/u21"
                compact
              />
              <HrCard
                title="Hrvatska NT"
                description="Pregled modula (preview). Igrači i skillovi su zaključani bez prijave."
                badge="Preview"
                href="/team/nt"
                compact
              />
            </div>

            <div style={{ marginTop: 14, color: "rgba(255,255,255,0.9)" }}>
              <div style={{ fontWeight: 900, textDecoration: "underline" }}>
                <Link href="/about">O alatu</Link> {" → "}
                <Link href="/help">Pomoć</Link> {" → "}
                <Link href="/donate">Donacije</Link> {" → "}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
