import Head from 'next/head'
import Link from 'next/link'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      <div className="hr-homeBg">
        <Header />

        <main className="hr-main">
          <div className="hr-container">
            <section className="home-mainPanel">
              <h1 className="home-panelTitle">
                Moji igrači u Hrvatskom trackeru
              </h1>

              <p className="home-panelSubtitle">
                CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji
                igrači”.
              </p>

              <div className="home-loginRow">
                <button className="home-loginBtn">Admin login</button>
                <button className="home-loginBtn ghost">CHPP login</button>
              </div>

              <div className="home-tilesRow">
                <Link href="/team/nt" className="home-tile image">
                  <img
                    className="home-tileImage"
                    src="/home/tile-nt.png"
                    alt="NT Hrvatska"
                  />
                </Link>

                <Link href="/team/u21" className="home-tile image">
                  <img
                    className="home-tileImage"
                    src="/home/tile-u21.png"
                    alt="U21 Hrvatska"
                  />
                </Link>

                <div className="home-tile transfer">
                  <div className="home-transferIcon">⇅</div>
                  <div className="home-transferTitle">Transfer lista</div>
                  <div className="home-transferSub">U izradi</div>
                </div>
              </div>

              <div className="home-subTiles">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="home-subTile">
                    <span>U izradi</span>
                  </div>
                ))}
              </div>
            </section>

            <Footer />
          </div>
        </main>
      </div>
    </>
  )
}
