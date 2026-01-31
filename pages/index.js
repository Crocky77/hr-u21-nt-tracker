import Head from 'next/head'
import Link from 'next/link'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Home() {
  const comingSoonLinks = [
    '/coming-soon?slot=1',
    '/coming-soon?slot=2',
    '/coming-soon?slot=3',
    '/coming-soon?slot=4',
    '/coming-soon?slot=5',
    '/coming-soon?slot=6',
    '/coming-soon?slot=7',
    '/coming-soon?slot=8',
  ]

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
                <Link href="/login" className="home-loginBtn">
                  Admin/Tester login
                </Link>
                <Link href="/my-players" className="home-loginBtn ghost">
                  CHPP login
                </Link>
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

                <Link href="/team/nt/transfers" className="home-tile transfer">
                  <div className="home-transferIcon">⇅</div>
                  <div className="home-transferTitle">Transfer lista</div>
                  <div className="home-transferSub">U izradi</div>
                </Link>
              </div>

              <div className="home-subTiles">
                {comingSoonLinks.map((href) => (
                  <Link key={href} href={href} className="home-subTile">
                    <span>U izradi</span>
                  </Link>
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
