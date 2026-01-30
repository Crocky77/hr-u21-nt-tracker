import Link from "next/link";
import Header from "../components/Header";

export default function HomePage() {
  return (
    <div className="hr-homeBg">
      <Header />

      <main className="hr-main">
        <div className="hr-container">
          {/* GLAVNI PANEL – kao referentna slika */}
          <div className="home-mainPanel">
            <h1 className="home-panelTitle">Moji igrači u Hrvatskom trackeru</h1>

            <p className="home-panelSubtitle">
              CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
            </p>

            {/* LOGIN – mora biti klikabilno, ali nenametljivo */}
            <div className="home-loginRow">
              <Link className="home-loginBtn ghost" href="/login">
                Admin / Tester login
              </Link>

              {/* CHPP kasnije – za sada disabled */}
              <span className="home-loginBtn disabled" title="CHPP login će biti aktivan nakon licence">
                CHPP login (uskoro)
              </span>
            </div>

            {/* 3 DOMINANTNA TILE-A – 1. red (NT / U21 / Transfer) */}
            <div className="home-tilesRow">
              {/* NT – slika je widget, nema teksta preko */}
              <Link
                href="/team/nt"
                className="home-tile image nt"
                aria-label="NT Hrvatska"
                title="NT Hrvatska"
              />

              {/* U21 */}
              <Link
                href="/team/u21"
                className="home-tile image u21"
                aria-label="U21 Hrvatska"
                title="U21 Hrvatska"
              />

              {/* Transfer – privremeno disabled (CHPP) */}
              <div className="home-tile transfer" aria-label="Transfer lista (CHPP)" title="Transfer lista">
                <div className="home-transferIcon">⇅</div>
                <div className="home-transferTitle">Transfer lista</div>
                <div className="home-transferSub">Privremeno nedostupno (CHPP)</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
