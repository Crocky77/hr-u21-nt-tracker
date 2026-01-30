import Header from "../components/Header";
import TileNT from "../components/TileNT";
import TileU21 from "../components/TileU21";
import TileTransfer from "../components/TileTransfer";

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
              <button className="home-loginBtn ghost">
                Admin / Tester login
              </button>
              <button className="home-loginBtn disabled">
                CHPP login (uskoro)
              </button>
            </div>

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
