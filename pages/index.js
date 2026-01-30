import Header from "../components/Header";
import TileNT from "../components/home/TileNT";
import TileU21 from "../components/home/TileU21";
import TileTransfer from "../components/home/TileTransfer";

export default function HomePage() {
  return (
    <div className="hr-homeBg">
      <Header />

      <main className="hr-main">
        <div className="hr-container">

          {/* GLAVNI PANEL */}
          <div className="home-mainPanel">

            <h1 className="home-panelTitle">
              Moji igrači u Hrvatskom trackeru
            </h1>

            <p className="home-panelSubtitle">
              CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
            </p>

            {/* LOGIN GUMBI – NENAMETLJIVI */}
            <div className="home-loginRow">
              <button className="home-loginBtn ghost">
                Admin / Tester login
              </button>
              <button className="home-loginBtn disabled">
                CHPP login (uskoro)
              </button>
            </div>

            {/* PRVI RED – 3 DOMINANTNA TILE-A */}
            <div className="home-tilesRow">
              <TileNT />
              <TileU21 />
              <TileTransfer />
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
