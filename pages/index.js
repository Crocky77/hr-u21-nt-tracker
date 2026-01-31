import Link from "next/link";
import Header from "../components/Header";
import TileFeatured from "../components/TileFeatured";
import "../styles/home-featured.css";

export default function HomePage() {
  return (
    <div className="hr-homeBg">
      <Header />

      <main className="hr-main">
        <div className="hr-container">
          <div className="home-mainPanel">
            <h1 className="home-panelTitle">
              Moji igrači u Hrvatskom trackeru
            </h1>

            <p className="home-panelSubtitle">
              CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
            </p>

            <div className="home-loginRow">
              <Link className="home-loginBtn ghost" href="/login">
                Admin / Tester login
              </Link>

              <span className="home-loginBtn disabled">
                CHPP login (uskoro)
              </span>
            </div>

            {/* PRVI RED – NT / U21 / TRANSFER */}
            <div className="home-tilesRow">
              <TileFeatured
                href="/team/nt"
                image="/home/tile-nt.png"
                label="NT Hrvatska"
              />

              <TileFeatured
                href="/team/u21"
                image="/home/tile-u21.png"
                label="U21 Hrvatska"
              />

              {/* TRANSFER – NE DIRAMO */}
              <div className="home-tile transfer">
                <div className="home-transferIcon">⇅</div>
                <div className="home-transferTitle">Transfer lista</div>
                <div className="home-transferSub">
                  Privremeno nedostupno (CHPP)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
